// Layout
export { AuthLayout } from '../ui/layout/auth-layout';

// Pages
export { LoginPage } from '../pages/login-page';
export { RegisterPage } from '../pages/register-page';
export { AccessDeniedPage } from '../pages/access-denied-page';
export { AdminUsersPage } from '../pages/admin/admin-users-page';

// Components (re-export para uso externo)
export { ProtectedSection } from '../ui/components/protected-section';
export { UserDropdown } from '../ui/components/user-dropdown';
export { AuthButton } from '../ui/components/auth-button';
export { AccessDenied } from '../ui/components/access-denied';
export { PendingApprovalCard } from '../ui/components/pending-approval-card';

// Hooks (re-export para uso externo)
export { AuthProvider } from '../hooks/auth-provider';
export { useAuth } from '../hooks/use-auth';

// Config (re-export para uso externo)
export { HOME_MODULES, hasAccess, getFullScreenPaths } from '../config/auth-config';

// Types (re-export para uso externo)
export type { UserRole, UserProfile, AuthState } from '../domain/types';
