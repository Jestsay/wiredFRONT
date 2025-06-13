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

interface GlobalState {
  // Core State
  activeProject: Project | null;
  projects: Project[];
  sidebarCollapsed: boolean;
  monitorVisible: boolean;
  
  // Loading States
  loading: boolean;
  projectsLoading: boolean;
  
  // Error States
  error: string | null;
  
  // Cache Management
  lastProjectsFetch: number;
  projectsCache: Map<string, Project>;
  
  // Rate Limiting Info
  rateLimitInfo: {
    remaining: number;
    resetTime: number;
  };
}

interface GlobalActions {
  // Project Management (Write Operations)
  setActiveProject: (project: Project | null) => void;
  createProject: (projectData: Partial<Project>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Data Fetching (Read Operations - Rate Limited)
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  
  // UI State Management
  toggleSidebar: () => void;
  toggleMonitor: () => void;
  
  // Error Management
  clearError: () => void;
  setError: (error: string) => void;
  
  // Cache Management
  invalidateProjectsCache: () => void;
  getProjectFromCache: (id: string) => Project | null;
  
  // Rate Limit Management
  updateRateLimitInfo: (operation: string) => void;
}

// Rate-limited API functions
const fetchProjectsRateLimited = createRateLimitedCall(
  'supabase-query',
  async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      let errorMessage = 'Failed to load projects';
      
      if (error.code === '42P17') {
        errorMessage = 'Database configuration issue. Please contact support.';
      } else if (error.code === 'PGRST301') {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (error.message.includes('JWT')) {
        errorMessage = 'Session expired. Please sign in again.';
      }
      
      throw new Error(errorMessage);
    }

    return data || [];
  },
  { retryOnLimit: true, maxRetries: 2 }
);

const createProjectRateLimited = createRateLimitedCall(
  'project-operations',
  async (projectData: Partial<Project>) => {
    if (!projectData.name?.trim()) {
      throw new Error('Project name is required');
    }

    if (!projectData.user_id) {
      throw new Error('User authentication required');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      let errorMessage = 'Failed to create project';
      
      if (error.code === '23505') {
        errorMessage = 'A project with this name already exists';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid user or category reference';
      } else if (error.code === 'PGRST301') {
        errorMessage = 'Permission denied. Please check your account status.';
      }
      
      throw new Error(errorMessage);
    }

    return data;
  },
  { keyGenerator: (data) => `user-${data.user_id}` }
);

export const useGlobalStore = create<GlobalState & GlobalActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    activeProject: null,
    projects: [],
    sidebarCollapsed: false,
    monitorVisible: true,
    loading: false,
    projectsLoading: false,
    error: null,
    lastProjectsFetch: 0,
    projectsCache: new Map(),
    rateLimitInfo: {
      remaining: 100,
      resetTime: 0
    },

    // Project Management Actions
    setActiveProject: (project) => {
      set({ activeProject: project });
      if (project) {
        localStorage.setItem('wf_active_project', JSON.stringify(project));
      } else {
        localStorage.removeItem('wf_active_project');
      }
    },

    fetchProjects: async () => {
      const state = get();
      
      // Check cache validity (5 minutes)
      const cacheValid = Date.now() - state.lastProjectsFetch < 5 * 60 * 1000;
      if (cacheValid && state.projects.length > 0) {
        return; // Use cached data
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
        
        // Update rate limit info
        get().updateRateLimitInfo('supabase-query');
        
      } catch (error) {
        console.error('Fetch projects error:', error);
        set({ 
          projectsLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to load projects. Please try again.' 
        });
      }
    },

    fetchProject: async (id: string) => {
      const state = get();
      
      // Check cache first
      const cached = state.projectsCache.get(id);
      if (cached) {
        return cached;
      }

      try {
        const allowed = await rateLimiter.checkLimit('supabase-query');
        if (!allowed) {
          throw new Error('Rate limit exceeded. Please wait before fetching more data.');
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw new Error('Project not found');
        }

        // Update cache
        set(state => ({
          projectsCache: new Map(state.projectsCache).set(id, data)
        }));

        get().updateRateLimitInfo('supabase-query');
        return data;
        
      } catch (error) {
        console.error('Fetch project error:', error);
        return null;
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
          lastProjectsFetch: Date.now() // Invalidate cache timestamp
        }));

        localStorage.setItem('wf_active_project', JSON.stringify(project));
        get().updateRateLimitInfo('project-operations');
        
      } catch (error) {
        console.error('Create project error:', error);
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to create project. Please try again.' 
        });
        throw error;
      }
    },

    updateProject: async (id: string, updates: Partial<Project>) => {
      try {
        const allowed = await rateLimiter.checkLimit('project-operations');
        if (!allowed) {
          throw new Error('Rate limit exceeded. Please wait before making more changes.');
        }

        const { data, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new Error('Failed to update project');
        }

        // Update state and cache
        set(state => ({
          projects: state.projects.map(p => p.id === id ? data : p),
          projectsCache: new Map(state.projectsCache).set(id, data),
          activeProject: state.activeProject?.id === id ? data : state.activeProject
        }));

        get().updateRateLimitInfo('project-operations');
        
      } catch (error) {
        console.error('Update project error:', error);
        get().setError(error instanceof Error ? error.message : 'Failed to update project');
        throw error;
      }
    },

    deleteProject: async (id: string) => {
      try {
        const allowed = await rateLimiter.checkLimit('project-operations');
        if (!allowed) {
          throw new Error('Rate limit exceeded. Please wait before making more changes.');
        }

        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) {
          throw new Error('Failed to delete project');
        }

        // Update state and cache
        set(state => {
          const newCache = new Map(state.projectsCache);
          newCache.delete(id);
          
          return {
            projects: state.projects.filter(p => p.id !== id),
            projectsCache: newCache,
            activeProject: state.activeProject?.id === id ? null : state.activeProject
          };
        });

        get().updateRateLimitInfo('project-operations');
        
      } catch (error) {
        console.error('Delete project error:', error);
        get().setError(error instanceof Error ? error.message : 'Failed to delete project');
        throw error;
      }
    },

    // UI State Management
    toggleSidebar: () => {
      set((state) => {
        const collapsed = !state.sidebarCollapsed;
        localStorage.setItem('wf_sidebar_collapsed', JSON.stringify(collapsed));
        return { sidebarCollapsed: collapsed };
      });
    },

    toggleMonitor: () => {
      set((state) => {
        const visible = !state.monitorVisible;
        localStorage.setItem('wf_monitor_visible', JSON.stringify(visible));
        return { monitorVisible: visible };
      });
    },

    // Error Management
    clearError: () => {
      set({ error: null });
    },

    setError: (error: string) => {
      set({ error });
    },

    // Cache Management
    invalidateProjectsCache: () => {
      set({ 
        lastProjectsFetch: 0,
        projectsCache: new Map()
      });
    },

    getProjectFromCache: (id: string) => {
      return get().projectsCache.get(id) || null;
    },

    // Rate Limit Management
    updateRateLimitInfo: (operation: string) => {
      const remaining = rateLimiter.getRemainingRequests(operation);
      const resetTime = rateLimiter.getResetTime(operation);
      
      set({
        rateLimitInfo: { remaining, resetTime }
      });
    }
  }))
);

// Initialize from localStorage with error handling
try {
  const storedProject = localStorage.getItem('wf_active_project');
  if (storedProject) {
    const project = JSON.parse(storedProject);
    useGlobalStore.setState({ activeProject: project });
  }
} catch (error) {
  console.error('Error loading stored project:', error);
  localStorage.removeItem('wf_active_project');
}

try {
  const storedSidebarCollapsed = localStorage.getItem('wf_sidebar_collapsed');
  if (storedSidebarCollapsed) {
    const collapsed = JSON.parse(storedSidebarCollapsed);
    useGlobalStore.setState({ sidebarCollapsed: collapsed });
  }
} catch (error) {
  console.error('Error loading sidebar state:', error);
  localStorage.removeItem('wf_sidebar_collapsed');
}

try {
  const storedMonitorVisible = localStorage.getItem('wf_monitor_visible');
  if (storedMonitorVisible) {
    const visible = JSON.parse(storedMonitorVisible);
    useGlobalStore.setState({ monitorVisible: visible });
  }
} catch (error) {
  console.error('Error loading monitor state:', error);
  localStorage.removeItem('wf_monitor_visible');
}

// Subscribe to projects changes for cache invalidation
useGlobalStore.subscribe(
  (state) => state.projects.length,
  (projectsLength, previousProjectsLength) => {
    if (projectsLength !== previousProjectsLength) {
      console.log(`Projects count changed: ${previousProjectsLength} -> ${projectsLength}`);
    }
  }
);