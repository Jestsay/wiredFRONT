import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '../api/supabase';
import { rateLimiter, createRateLimitedCall } from './rateLimiter';

interface Project {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  github_repo: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  project_type: string | null;
  tech_stack: any | null;
  features: any | null;
  demo_url: string | null;
  preview_image_url: string | null;
  tags: any | null;
  visibility: string | null;
  view_count: number | null;
  like_count: number | null;
  download_count: number | null;
  category_id: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
}

interface GitHubConnection {
  connected: boolean;
  username: string | null;
  avatar_url: string | null;
  access_token: string | null;
  repos: GitHubRepo[];
  lastSync: Date | null;
}

interface ProjectWizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface ProjectWizardData {
  // Step 1: Project Basics
  name: string;
  description: string;
  project_type: 'web' | 'mobile' | 'desktop' | 'api';
  
  // Step 2: Context & Requirements
  problemStatement: string;
  targetAudience: string;
  primaryGoals: string[];
  successMetrics: string;
  
  // Step 3: Technical Details
  tech_stack: string[];
  features: string[];
  integrations: string[];
  
  // Step 4: Design & UX
  designStyle: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layoutPreferences: string[];
  
  // Step 5: GitHub Integration
  github_repo: string | null;
  repository_setup: 'new' | 'existing' | 'none';
  
  // Step 6: Deployment & Hosting
  deployment_target: string[];
  hosting_preferences: string[];
  
  // Metadata
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  timelineExpectation: string;
  budgetRange: string;
}

interface ProjectState {
  // Core Project Data
  projects: Project[];
  activeProject: Project | null;
  
  // GitHub Integration
  githubConnection: GitHubConnection;
  
  // Project Wizard
  wizardOpen: boolean;
  wizardStep: number;
  wizardSteps: ProjectWizardStep[];
  wizardData: ProjectWizardData;
  
  // Loading States
  loading: boolean;
  projectsLoading: boolean;
  githubLoading: boolean;
  wizardLoading: boolean;
  
  // Error States
  error: string | null;
  githubError: string | null;
  wizardError: string | null;
  
  // Cache Management
  lastProjectsFetch: number;
  projectsCache: Map<string, Project>;
  
  // Analytics
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    githubConnectedProjects: number;
  };
}

interface ProjectActions {
  // Project Management
  fetchProjects: () => Promise<void>;
  createProject: (projectData: Partial<Project>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
  
  // GitHub Integration
  connectGitHub: () => Promise<void>;
  disconnectGitHub: () => Promise<void>;
  fetchGitHubRepos: () => Promise<void>;
  createGitHubRepo: (name: string, description: string, isPrivate: boolean) => Promise<GitHubRepo>;
  linkProjectToRepo: (projectId: string, repoUrl: string) => Promise<void>;
  
  // Project Wizard
  openWizard: () => void;
  closeWizard: () => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  updateWizardData: (data: Partial<ProjectWizardData>) => void;
  submitWizard: () => Promise<void>;
  resetWizard: () => void;
  
  // Error Management
  clearError: () => void;
  clearGitHubError: () => void;
  clearWizardError: () => void;
  
  // Cache Management
  invalidateCache: () => void;
  refreshProjectStats: () => void;
}

// Rate-limited API functions
const fetchProjectsRateLimited = createRateLimitedCall(
  'project-operations',
  async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to fetch projects');
    }

    return data || [];
  },
  { retryOnLimit: true, maxRetries: 2 }
);

const createProjectRateLimited = createRateLimitedCall(
  'project-operations',
  async (projectData: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create project');
    }

    return data;
  }
);

// GitHub API functions
const fetchGitHubReposRateLimited = createRateLimitedCall(
  'github-api',
  async (accessToken: string) => {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repositories');
    }

    return response.json();
  }
);

// Default wizard steps
const defaultWizardSteps: ProjectWizardStep[] = [
  {
    id: 'basics',
    title: 'Project Basics',
    description: 'Tell us about your project idea',
    completed: false,
    required: true,
  },
  {
    id: 'context',
    title: 'Context & Requirements',
    description: 'Help us understand your goals and requirements',
    completed: false,
    required: true,
  },
  {
    id: 'technical',
    title: 'Technical Details',
    description: 'Choose your technology stack and features',
    completed: false,
    required: true,
  },
  {
    id: 'design',
    title: 'Design & UX',
    description: 'Define your visual preferences and user experience',
    completed: false,
    required: false,
  },
  {
    id: 'github',
    title: 'GitHub Integration',
    description: 'Connect your project to GitHub for version control',
    completed: false,
    required: false,
  },
  {
    id: 'deployment',
    title: 'Deployment & Hosting',
    description: 'Plan your deployment and hosting strategy',
    completed: false,
    required: false,
  },
];

// Default wizard data
const defaultWizardData: ProjectWizardData = {
  name: '',
  description: '',
  project_type: 'web',
  problemStatement: '',
  targetAudience: '',
  primaryGoals: [],
  successMetrics: '',
  tech_stack: [],
  features: [],
  integrations: [],
  designStyle: '',
  colorScheme: {
    primary: '#6c26de',
    secondary: '#7dd3fc',
    accent: '#fa1474',
  },
  layoutPreferences: [],
  github_repo: null,
  repository_setup: 'none',
  deployment_target: [],
  hosting_preferences: [],
  estimatedComplexity: 'moderate',
  timelineExpectation: '',
  budgetRange: '',
};

export const useProjectStore = create<ProjectState & ProjectActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    projects: [],
    activeProject: null,
    githubConnection: {
      connected: false,
      username: null,
      avatar_url: null,
      access_token: null,
      repos: [],
      lastSync: null,
    },
    wizardOpen: false,
    wizardStep: 0,
    wizardSteps: defaultWizardSteps,
    wizardData: defaultWizardData,
    loading: false,
    projectsLoading: false,
    githubLoading: false,
    wizardLoading: false,
    error: null,
    githubError: null,
    wizardError: null,
    lastProjectsFetch: 0,
    projectsCache: new Map(),
    projectStats: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      githubConnectedProjects: 0,
    },

    // Project Management Actions
    fetchProjects: async () => {
      const state = get();
      
      // Check cache validity (5 minutes)
      const cacheValid = Date.now() - state.lastProjectsFetch < 5 * 60 * 1000;
      if (cacheValid && state.projects.length > 0) {
        return;
      }

      set({ projectsLoading: true, error: null });
      
      try {
        const projects = await fetchProjectsRateLimited();
        
        // Update cache
        const projectsCache = new Map();
        projects.forEach(project => {
          projectsCache.set(project.id, project);
        });
        
        set({ 
          projects, 
          projectsCache,
          projectsLoading: false, 
          error: null,
          lastProjectsFetch: Date.now()
        });
        
        // Update stats
        get().refreshProjectStats();
        
      } catch (error) {
        console.error('Fetch projects error:', error);
        set({ 
          projectsLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to load projects' 
        });
      }
    },

    createProject: async (projectData) => {
      set({ loading: true, error: null });
      
      try {
        const project = await createProjectRateLimited(projectData);
        
        set((state) => ({ 
          projects: [project, ...state.projects],
          projectsCache: new Map(state.projectsCache).set(project.id, project),
          activeProject: project,
          loading: false,
          error: null,
          lastProjectsFetch: Date.now()
        }));

        localStorage.setItem('wf_active_project', JSON.stringify(project));
        get().refreshProjectStats();
        
      } catch (error) {
        console.error('Create project error:', error);
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to create project' 
        });
        throw error;
      }
    },

    updateProject: async (id: string, updates: Partial<Project>) => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        set(state => ({
          projects: state.projects.map(p => p.id === id ? data : p),
          projectsCache: new Map(state.projectsCache).set(id, data),
          activeProject: state.activeProject?.id === id ? data : state.activeProject
        }));

        get().refreshProjectStats();
        
      } catch (error) {
        console.error('Update project error:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update project' });
        throw error;
      }
    },

    deleteProject: async (id: string) => {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) {
          throw new Error(error.message);
        }

        set(state => {
          const newCache = new Map(state.projectsCache);
          newCache.delete(id);
          
          return {
            projects: state.projects.filter(p => p.id !== id),
            projectsCache: newCache,
            activeProject: state.activeProject?.id === id ? null : state.activeProject
          };
        });

        get().refreshProjectStats();
        
      } catch (error) {
        console.error('Delete project error:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to delete project' });
        throw error;
      }
    },

    setActiveProject: (project) => {
      set({ activeProject: project });
      if (project) {
        localStorage.setItem('wf_active_project', JSON.stringify(project));
      } else {
        localStorage.removeItem('wf_active_project');
      }
    },

    // GitHub Integration Actions
    connectGitHub: async () => {
      set({ githubLoading: true, githubError: null });
      
      try {
        // Redirect to GitHub OAuth
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        if (!clientId) {
          throw new Error('GitHub Client ID not configured');
        }

        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const scope = 'repo,user:email';
        const state = Math.random().toString(36).substring(7);
        
        localStorage.setItem('github_oauth_state', state);
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        
        window.location.href = authUrl;
        
      } catch (error) {
        console.error('GitHub connect error:', error);
        set({ 
          githubLoading: false, 
          githubError: error instanceof Error ? error.message : 'Failed to connect to GitHub' 
        });
      }
    },

    disconnectGitHub: async () => {
      set({
        githubConnection: {
          connected: false,
          username: null,
          avatar_url: null,
          access_token: null,
          repos: [],
          lastSync: null,
        },
        githubError: null,
      });
      
      localStorage.removeItem('github_access_token');
      localStorage.removeItem('github_user_data');
    },

    fetchGitHubRepos: async () => {
      const { githubConnection } = get();
      
      if (!githubConnection.connected || !githubConnection.access_token) {
        throw new Error('GitHub not connected');
      }

      set({ githubLoading: true, githubError: null });
      
      try {
        const repos = await fetchGitHubReposRateLimited(githubConnection.access_token);
        
        set(state => ({
          githubConnection: {
            ...state.githubConnection,
            repos,
            lastSync: new Date(),
          },
          githubLoading: false,
        }));
        
      } catch (error) {
        console.error('Fetch GitHub repos error:', error);
        set({ 
          githubLoading: false, 
          githubError: error instanceof Error ? error.message : 'Failed to fetch repositories' 
        });
      }
    },

    createGitHubRepo: async (name: string, description: string, isPrivate: boolean) => {
      const { githubConnection } = get();
      
      if (!githubConnection.connected || !githubConnection.access_token) {
        throw new Error('GitHub not connected');
      }

      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubConnection.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create GitHub repository');
      }

      const repo = await response.json();
      
      // Refresh repos list
      await get().fetchGitHubRepos();
      
      return repo;
    },

    linkProjectToRepo: async (projectId: string, repoUrl: string) => {
      await get().updateProject(projectId, { github_repo: repoUrl });
    },

    // Project Wizard Actions
    openWizard: () => {
      set({ 
        wizardOpen: true, 
        wizardStep: 0,
        wizardSteps: defaultWizardSteps.map(step => ({ ...step, completed: false })),
        wizardData: { ...defaultWizardData },
        wizardError: null,
      });
    },

    closeWizard: () => {
      set({ wizardOpen: false, wizardError: null });
    },

    nextWizardStep: () => {
      const { wizardStep, wizardSteps } = get();
      if (wizardStep < wizardSteps.length - 1) {
        // Mark current step as completed
        const updatedSteps = [...wizardSteps];
        updatedSteps[wizardStep].completed = true;
        
        set({ 
          wizardStep: wizardStep + 1,
          wizardSteps: updatedSteps,
        });
      }
    },

    prevWizardStep: () => {
      const { wizardStep } = get();
      if (wizardStep > 0) {
        set({ wizardStep: wizardStep - 1 });
      }
    },

    updateWizardData: (data) => {
      set(state => ({
        wizardData: { ...state.wizardData, ...data }
      }));
    },

    submitWizard: async () => {
      const { wizardData } = get();
      set({ wizardLoading: true, wizardError: null });
      
      try {
        // Validate required fields
        if (!wizardData.name.trim()) {
          throw new Error('Project name is required');
        }
        
        if (!wizardData.problemStatement.trim()) {
          throw new Error('Problem statement is required for accuracy');
        }

        // Create project from wizard data
        const projectData: Partial<Project> = {
          name: wizardData.name,
          description: wizardData.description,
          project_type: wizardData.project_type,
          tech_stack: wizardData.tech_stack,
          features: wizardData.features,
          github_repo: wizardData.github_repo,
          visibility: 'private',
          // Store additional context in tags for now
          tags: {
            problemStatement: wizardData.problemStatement,
            targetAudience: wizardData.targetAudience,
            primaryGoals: wizardData.primaryGoals,
            successMetrics: wizardData.successMetrics,
            designStyle: wizardData.designStyle,
            colorScheme: wizardData.colorScheme,
            estimatedComplexity: wizardData.estimatedComplexity,
            timelineExpectation: wizardData.timelineExpectation,
          },
        };

        await get().createProject(projectData);
        
        set({ 
          wizardLoading: false, 
          wizardOpen: false,
          wizardError: null,
        });
        
      } catch (error) {
        console.error('Submit wizard error:', error);
        set({ 
          wizardLoading: false, 
          wizardError: error instanceof Error ? error.message : 'Failed to create project' 
        });
        throw error;
      }
    },

    resetWizard: () => {
      set({
        wizardStep: 0,
        wizardSteps: defaultWizardSteps.map(step => ({ ...step, completed: false })),
        wizardData: { ...defaultWizardData },
        wizardError: null,
      });
    },

    // Error Management
    clearError: () => set({ error: null }),
    clearGitHubError: () => set({ githubError: null }),
    clearWizardError: () => set({ wizardError: null }),

    // Cache Management
    invalidateCache: () => {
      set({ 
        lastProjectsFetch: 0,
        projectsCache: new Map()
      });
    },

    refreshProjectStats: () => {
      const { projects } = get();
      
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.is_active).length,
        completedProjects: projects.filter(p => p.demo_url || p.github_repo).length,
        githubConnectedProjects: projects.filter(p => p.github_repo).length,
      };
      
      set({ projectStats: stats });
    },
  }))
);

// Initialize from localStorage
try {
  const storedProject = localStorage.getItem('wf_active_project');
  if (storedProject) {
    const project = JSON.parse(storedProject);
    useProjectStore.setState({ activeProject: project });
  }
} catch (error) {
  console.error('Error loading stored project:', error);
  localStorage.removeItem('wf_active_project');
}

// Initialize GitHub connection from localStorage
try {
  const githubToken = localStorage.getItem('github_access_token');
  const githubUser = localStorage.getItem('github_user_data');
  
  if (githubToken && githubUser) {
    const userData = JSON.parse(githubUser);
    useProjectStore.setState({
      githubConnection: {
        connected: true,
        username: userData.login,
        avatar_url: userData.avatar_url,
        access_token: githubToken,
        repos: [],
        lastSync: null,
      }
    });
  }
} catch (error) {
  console.error('Error loading GitHub connection:', error);
  localStorage.removeItem('github_access_token');
  localStorage.removeItem('github_user_data');
}

// Subscribe to projects changes for analytics
useProjectStore.subscribe(
  (state) => state.projects,
  (projects) => {
    useProjectStore.getState().refreshProjectStats();
  }
);