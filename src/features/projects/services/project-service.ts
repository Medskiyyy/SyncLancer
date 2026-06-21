import { ProjectRepository } from '../repositories/project-repository';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project';
import { Project, Role, ProjectStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private workspaceService: WorkspaceService;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.workspaceService = new WorkspaceService();
  }

  async getProjects(workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    return this.projectRepository.listByWorkspaceId(workspaceId);
  }

  async getProjectById(projectId: string, workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    const project = await this.projectRepository.findById(projectId);
    if (!project || project.workspaceId !== workspaceId) {
      return null;
    }
    return project;
  }

  async getTemplates(workspaceId: string, userId: string) {
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);
    await this.seedSystemTemplates();
    return this.projectRepository.listTemplates(workspaceId);
  }

  async createProject(workspaceId: string, userId: string, input: CreateProjectInput) {
    // 1. Validate workspace membership & RBAC (Role.OWNER)
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    // 2. Fetch workspace to check plan
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    return prisma.$transaction(async (tx) => {
      // 3. If status is ACTIVE, check active project limits
      if (input.status === ProjectStatus.ACTIVE) {
        const activeProjectsCount = await tx.project.count({
          where: {
            workspaceId,
            status: ProjectStatus.ACTIVE,
            deletedAt: null,
          },
        });

        if (workspace.plan === 'FREE' && activeProjectsCount >= 3) {
          const error = new Error('Active project limit reached (max 3 active projects on Free plan). Please upgrade to Pro.');
          (error as any).code = 'LIMIT_EXCEEDED';
          throw error;
        }
      }

      // 4. Create the project
      const budgetDecimal = new Decimal(input.budget);
      const project = await tx.project.create({
        data: {
          workspaceId,
          clientId: input.clientId,
          name: input.name,
          description: input.description || '',
          budget: budgetDecimal,
          currency: input.currency || 'USD',
          startDate: input.startDate,
          deadline: input.deadline,
          status: input.status,
          progress: 0,
        },
        include: {
          client: true,
        },
      });

      // 5. If status is ACTIVE, increment activeProjectsCount in SubscriptionUsage
      if (input.status === ProjectStatus.ACTIVE) {
        await tx.subscriptionUsage.update({
          where: { workspaceId },
          data: {
            activeProjectsCount: {
              increment: 1,
            },
          },
        });
      }

      // 6. If templateId is provided, spawn milestones and tasks
      if (input.templateId) {
        const template = await tx.projectTemplate.findUnique({
          where: { id: input.templateId },
          include: {
            milestones: {
              orderBy: { sortOrder: 'asc' },
              include: {
                tasks: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        });

        if (template) {
          const milestones = template.milestones;
          const N = milestones.length;
          const start = new Date(input.startDate).getTime();
          const end = new Date(input.deadline).getTime();

          for (let i = 0; i < N; i++) {
            const tm = milestones[i];

            // Calculate even distribution
            let dueDate = new Date(input.deadline);
            if (N > 1) {
              const timeDiff = end - start;
              const fraction = (i + 1) / N;
              dueDate = new Date(start + timeDiff * fraction);
            }

            // Create Milestone
            const milestone = await tx.milestone.create({
              data: {
                projectId: project.id,
                title: tm.title,
                description: `Milestone: ${tm.title}`,
                dueDate,
                progress: 0,
                status: 'NOT_STARTED',
                sortOrder: tm.sortOrder,
              },
            });

            // Create Tasks for this Milestone
            for (const tt of tm.tasks) {
              await tx.task.create({
                data: {
                  projectId: project.id,
                  milestoneId: milestone.id,
                  title: tt.title,
                  description: `Task: ${tt.title}`,
                  status: 'TODO',
                  priority: 'MEDIUM',
                  dueDate,
                },
              });
            }
          }
        }
      }

      return project;
    });
  }

  async updateProject(projectId: string, workspaceId: string, userId: string, input: UpdateProjectInput) {
    // 1. Validate workspace membership & RBAC (Role.OWNER)
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    // 2. Fetch project
    const existingProject = await this.projectRepository.findById(projectId);
    if (!existingProject || existingProject.workspaceId !== workspaceId) {
      throw new Error('Project not found or does not belong to this workspace.');
    }

    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    return prisma.$transaction(async (tx) => {
      // If status changes to ACTIVE, check limit
      if (input.status === ProjectStatus.ACTIVE && existingProject.status !== ProjectStatus.ACTIVE) {
        const activeProjectsCount = await tx.project.count({
          where: {
            workspaceId,
            status: ProjectStatus.ACTIVE,
            deletedAt: null,
          },
        });

        if (workspace.plan === 'FREE' && activeProjectsCount >= 3) {
          const error = new Error('Active project limit reached (max 3 active projects on Free plan). Please upgrade to Pro.');
          (error as any).code = 'LIMIT_EXCEEDED';
          throw error;
        }

        // Increment usage count
        await tx.subscriptionUsage.update({
          where: { workspaceId },
          data: {
            activeProjectsCount: {
              increment: 1,
            },
          },
        });
      } else if (input.status !== undefined && input.status !== ProjectStatus.ACTIVE && existingProject.status === ProjectStatus.ACTIVE) {
        // Decrement usage count
        await tx.subscriptionUsage.update({
          where: { workspaceId },
          data: {
            activeProjectsCount: {
              decrement: 1,
            },
          },
        });
      }

      // Perform update
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.budget !== undefined) updateData.budget = new Decimal(input.budget);
      if (input.currency !== undefined) updateData.currency = input.currency;
      if (input.startDate !== undefined) updateData.startDate = input.startDate;
      if (input.deadline !== undefined) updateData.deadline = input.deadline;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.progress !== undefined) updateData.progress = input.progress;

      return tx.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
          client: true,
        },
      });
    });
  }

  async deleteProject(projectId: string, workspaceId: string, userId: string) {
    // Validate workspace membership & RBAC (Role.OWNER)
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    const existingProject = await this.projectRepository.findById(projectId);
    if (!existingProject || existingProject.workspaceId !== workspaceId) {
      throw new Error('Project not found or does not belong to this workspace.');
    }

    return prisma.$transaction(async (tx) => {
      // Soft delete the project
      const deletedProject = await tx.project.update({
        where: { id: projectId },
        data: { deletedAt: new Date() },
      });

      // If it was ACTIVE, decrement subscription usage count
      if (existingProject.status === ProjectStatus.ACTIVE) {
        await tx.subscriptionUsage.update({
          where: { workspaceId },
          data: {
            activeProjectsCount: {
              decrement: 1,
            },
          },
        });
      }

      return deletedProject;
    });
  }

  private async seedSystemTemplates() {
    const systemTemplatesCount = await prisma.projectTemplate.count({
      where: { isSystem: true },
    });

    if (systemTemplatesCount > 0) {
      return;
    }

    const templatesData = [
      {
        name: 'Website Development',
        description: 'Standard website design and development timeline.',
        isSystem: true,
        milestones: {
          create: [
            {
              title: 'Planning & Design',
              sortOrder: 0,
              tasks: {
                create: [
                  { title: 'Wireframing', sortOrder: 0 },
                  { title: 'UI Design Mockups', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Frontend Development',
              sortOrder: 1,
              tasks: {
                create: [
                  { title: 'Setup project codebase', sortOrder: 0 },
                  { title: 'Build UI components', sortOrder: 1 },
                  { title: 'Integrate API endpoints', sortOrder: 2 },
                ],
              },
            },
            {
              title: 'Testing & Launch',
              sortOrder: 2,
              tasks: {
                create: [
                  { title: 'QA and bug fixing', sortOrder: 0 },
                  { title: 'Deployment', sortOrder: 1 },
                ],
              },
            },
          ],
        },
      },
      {
        name: 'Mobile App Development',
        description: 'Mobile application development lifecycle.',
        isSystem: true,
        milestones: {
          create: [
            {
              title: 'Requirements & Architecture',
              sortOrder: 0,
              tasks: {
                create: [
                  { title: 'App flow design', sortOrder: 0 },
                  { title: 'Setup development environment', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Development Phase',
              sortOrder: 1,
              tasks: {
                create: [
                  { title: 'Backend API integration', sortOrder: 0 },
                  { title: 'Frontend screens implementation', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Review & App Store Submit',
              sortOrder: 2,
              tasks: {
                create: [
                  { title: 'Beta testing', sortOrder: 0 },
                  { title: 'Submit to App Store / Play Store', sortOrder: 1 },
                ],
              },
            },
          ],
        },
      },
      {
        name: 'UI/UX Design',
        description: 'Comprehensive research and interface design project.',
        isSystem: true,
        milestones: {
          create: [
            {
              title: 'Research & Discovery',
              sortOrder: 0,
              tasks: {
                create: [
                  { title: 'User interviews', sortOrder: 0 },
                  { title: 'Competitive analysis', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Wireframing & Prototyping',
              sortOrder: 1,
              tasks: {
                create: [
                  { title: 'Low-fidelity wireframes', sortOrder: 0 },
                  { title: 'Interactive prototype', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'High-Fidelity Design',
              sortOrder: 2,
              tasks: {
                create: [
                  { title: 'Visual design guidelines', sortOrder: 0 },
                  { title: 'High-fidelity screens handover', sortOrder: 1 },
                ],
              },
            },
          ],
        },
      },
      {
        name: 'SEO Campaign',
        description: 'Search Engine Optimization audit and content optimization.',
        isSystem: true,
        milestones: {
          create: [
            {
              title: 'Audit & Strategy',
              sortOrder: 0,
              tasks: {
                create: [
                  { title: 'Website audit', sortOrder: 0 },
                  { title: 'Keyword research', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'On-Page Optimization',
              sortOrder: 1,
              tasks: {
                create: [
                  { title: 'Optimize metadata', sortOrder: 0 },
                  { title: 'Content optimization', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Link Building & Report',
              sortOrder: 2,
              tasks: {
                create: [
                  { title: 'Backlink outreach', sortOrder: 0 },
                  { title: 'Monthly performance report', sortOrder: 1 },
                ],
              },
            },
          ],
        },
      },
      {
        name: 'Content Marketing',
        description: 'Content strategy, creation, and distribution.',
        isSystem: true,
        milestones: {
          create: [
            {
              title: 'Content Planning',
              sortOrder: 0,
              tasks: {
                create: [
                  { title: 'Editorial calendar creation', sortOrder: 0 },
                  { title: 'Topic research', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Content Production',
              sortOrder: 1,
              tasks: {
                create: [
                  { title: 'Draft articles', sortOrder: 0 },
                  { title: 'Graphic/Visual asset creation', sortOrder: 1 },
                ],
              },
            },
            {
              title: 'Distribution & Analytics',
              sortOrder: 2,
              tasks: {
                create: [
                  { title: 'Social media distribution', sortOrder: 0 },
                  { title: 'Analytics tracking', sortOrder: 1 },
                ],
              },
            },
          ],
        },
      },
    ];

    for (const t of templatesData) {
      await prisma.projectTemplate.create({
        data: t,
      });
    }
  }
}
