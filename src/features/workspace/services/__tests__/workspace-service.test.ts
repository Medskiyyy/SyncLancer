import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks must be declared before any imports that transitively load the module ──
vi.mock('@/lib/prisma', () => ({
  default: {
    workspace: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    workspaceMember: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/features/workspace/repositories/workspace-repository', () => {
  const mock = vi.fn();
  mock.prototype.findBySlug = vi.fn();
  mock.prototype.findById = vi.fn();
  mock.prototype.findMembership = vi.fn();
  mock.prototype.listByUserId = vi.fn();
  mock.prototype.create = vi.fn();
  mock.prototype.update = vi.fn();
  mock.prototype.delete = vi.fn();
  return { WorkspaceRepository: mock };
});

import { WorkspaceService } from '../workspace-service';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { WorkspaceRepository } from '@/features/workspace/repositories/workspace-repository';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  const WORKSPACE_ID = 'ws-uuid-1';
  const USER_ID = 'user-uuid-1';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkspaceService();
  });

  const repo = () => (WorkspaceRepository as ReturnType<typeof vi.fn>).mock.results.at(-1)!.value;

  // ───────────────────────────────────────────────
  // createWorkspace
  // ───────────────────────────────────────────────
  describe('createWorkspace', () => {
    it('throws when user already owns a FREE workspace', async () => {
      (prisma.workspace.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 'existing-ws', plan: 'FREE' },
      ]);

      await expect(
        service.createWorkspace(USER_ID, { name: 'My Workspace' })
      ).rejects.toThrow('Workspace limit reached');
    });

    it('allows creation when user has no workspaces', async () => {
      (prisma.workspace.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      repo().findBySlug.mockResolvedValue(null);
      repo().create.mockResolvedValue({ id: 'new-ws', slug: 'my-workspace' });

      const result = await service.createWorkspace(USER_ID, { name: 'My Workspace' });

      expect(result).toMatchObject({ id: 'new-ws' });
      expect(repo().create).toHaveBeenCalledWith(USER_ID, 'My Workspace', 'my-workspace');
    });

    it('appends counter when slug is taken', async () => {
      (prisma.workspace.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      repo().findBySlug
        .mockResolvedValueOnce({ id: 'taken' })
        .mockResolvedValueOnce(null);
      repo().create.mockResolvedValue({ id: 'new-ws', slug: 'my-workspace-1' });

      await service.createWorkspace(USER_ID, { name: 'My Workspace' });

      expect(repo().create).toHaveBeenCalledWith(USER_ID, 'My Workspace', 'my-workspace-1');
    });
  });

  // ───────────────────────────────────────────────
  // validateWorkspaceAccess
  // ───────────────────────────────────────────────
  describe('validateWorkspaceAccess', () => {
    it('throws when user is not a member', async () => {
      repo().findMembership.mockResolvedValue(null);
      await expect(service.validateWorkspaceAccess(WORKSPACE_ID, USER_ID)).rejects.toThrow(
        'not a member'
      );
    });

    it('throws when member role is not in allowed roles', async () => {
      repo().findMembership.mockResolvedValue({ role: Role.MEMBER });
      await expect(
        service.validateWorkspaceAccess(WORKSPACE_ID, USER_ID, [Role.OWNER])
      ).rejects.toThrow('required permissions');
    });

    it('returns membership when role is allowed', async () => {
      repo().findMembership.mockResolvedValue({ role: Role.OWNER });
      const membership = await service.validateWorkspaceAccess(WORKSPACE_ID, USER_ID, [Role.OWNER]);
      expect(membership.role).toBe(Role.OWNER);
    });

    it('returns membership when no roles are required', async () => {
      repo().findMembership.mockResolvedValue({ role: Role.MEMBER });
      const membership = await service.validateWorkspaceAccess(WORKSPACE_ID, USER_ID);
      expect(membership.role).toBe(Role.MEMBER);
    });
  });

  // ───────────────────────────────────────────────
  // deleteWorkspace
  // ───────────────────────────────────────────────
  describe('deleteWorkspace', () => {
    it('throws when workspace does not exist', async () => {
      repo().findById.mockResolvedValue(null);
      await expect(service.deleteWorkspace(WORKSPACE_ID, USER_ID)).rejects.toThrow(
        'Workspace not found'
      );
    });

    it('throws when user is not the owner', async () => {
      repo().findById.mockResolvedValue({ id: WORKSPACE_ID, ownerId: 'other-user' });
      await expect(service.deleteWorkspace(WORKSPACE_ID, USER_ID)).rejects.toThrow(
        'Only the workspace owner'
      );
    });

    it('deletes when user is the owner', async () => {
      repo().findById.mockResolvedValue({ id: WORKSPACE_ID, ownerId: USER_ID });
      repo().delete.mockResolvedValue({ id: WORKSPACE_ID });

      const result = await service.deleteWorkspace(WORKSPACE_ID, USER_ID);
      expect(result.id).toBe(WORKSPACE_ID);
      expect(repo().delete).toHaveBeenCalledWith(WORKSPACE_ID);
    });
  });

  // ───────────────────────────────────────────────
  // Slug generation
  // ───────────────────────────────────────────────
  describe('slug generation', () => {
    beforeEach(() => {
      (prisma.workspace.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      repo().create.mockImplementation((_uid: string, name: string, slug: string) =>
        Promise.resolve({ id: 'new', slug })
      );
    });

    it.each([
      ['Hello World', 'hello-world'],
      ['My  Company!', 'my-company'],
      ['  Trimmed  ', 'trimmed'],
    ])('slugifies "%s" → "%s"', async (name, expectedSlug) => {
      repo().findBySlug.mockResolvedValue(null);
      await service.createWorkspace(USER_ID, { name });
      expect(repo().create).toHaveBeenCalledWith(USER_ID, name, expectedSlug);
    });
  });
});
