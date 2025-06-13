// Core Application Types

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: 'subscriber' | 'tester' | 'admin' | 'super_admin';
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  githubRepoUrl?: string;
  contextData: ProjectContext;
  status: 'draft' | 'active' | 'deployed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectContext {
  problemStatement: string;
  primaryUser: string;
  painPoint: string;
  successMetrics: string;
  layoutDescription: string;
  aesthetic: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  userFlows: UserFlow[];
  dataEntities: DataEntity[];
}

export interface UserFlow {
  id: string;
  name: string;
  steps: string[];
  edgeCases: string[];
}

export interface DataEntity {
  id: string;
  name: string;
  fields: EntityField[];
}

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ChatMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiresPermission?: string;
  component: React.ComponentType;
}

export interface GlobalState {
  user: User | null;
  activeProject: Project | null;
  projects: Project[];
  chatMode: string;
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  githubRepoUrl?: string;
}