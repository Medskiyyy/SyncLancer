import { WorkspaceRepository } from '../repositories/workspace-repository';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../schemas/workspace';
import { Workspace, WorkspaceMember, Role } from '@prisma/client';

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
  }

  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    const slugBase = input.slug || this.slugify(input.name);
    let slug = slugBase;
    let counter = 1;

    // Ensure slug uniqueness
    while (true) {
      const existing = await this.workspaceRepository.findBySlug(slug);
      if (!existing) {
        break;
      }
      slug = `${slugBase}-${counter}`;
      counter++;
    }

    return this.workspaceRepository.create(userId, input.name, slug);
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.listByUserId(userId);
  }

  async getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
    return this.workspaceRepository.findBySlug(slug);
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    return this.workspaceRepository.findById(id);
  }

  async validateWorkspaceAccess(
    workspaceId: string,
    userId: string,
    allowedRoles?: Role[],
  ): Promise<WorkspaceMember> {
    const membership = await this.workspaceRepository.findMembership(workspaceId, userId);
    
    if (!membership) {
      throw new Error('Access denied: You are not a member of this workspace.');
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
      throw new Error('Access denied: You do not have the required permissions.');
    }

    return membership;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    // RBAC: Verify user is OWNER in this workspace
    await this.validateWorkspaceAccess(workspaceId, userId, [Role.OWNER]);

    return this.workspaceRepository.update(workspaceId, {
      name: input.name,
      logoUrl: input.logoUrl,
    });
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found.');
    }

    // Only the primary owner can delete the workspace
    if (workspace.ownerId !== userId) {
      throw new Error('Access denied: Only the workspace owner can delete it.');
    }

    return this.workspaceRepository.delete(workspaceId);
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  }
}
