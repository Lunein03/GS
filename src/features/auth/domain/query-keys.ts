export const authKeys = {
  all: ['auth'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
  users: () => ['auth', 'users'] as const,
  pendingUsers: () => ['auth', 'users', 'pending'] as const,
};
