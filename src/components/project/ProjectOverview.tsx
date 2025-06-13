import React from 'react';
import { 
  Plus, 
  Github, 
  ExternalLink, 
  Calendar, 
  Users, 
  Code, 
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  GitBranch,
  Activity
} from 'lucide-react';
import { useProjectStore } from '../../state/projectStore';
import { useAuthStore } from '../../state/authStore';

export function ProjectOverview() {
  const { 
    projects, 
    activeProject, 
    projectStats, 
    githubConnection, 
    projectsLoading,
    openWizard,
    setActiveProject,
    connectGitHub,
    fetchGitHubRepos
  } = useProjectStore();
  
  const { user } = useAuthStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProjectStatusColor = (project: any) => {
    if (project.demo_url) return 'var(--color-success)';
    if (project.github_repo) return 'var(--color-info)';
    if (project.is_active) return 'var(--color-warning)';
    return 'var(--color-muted)';
  };

  const getProjectStatusIcon = (project: any) => {
    if (project.demo_url) return CheckCircle;
    if (project.github_repo) return GitBranch;
    if (project.is_active) return Clock;
    return AlertCircle;
  };

  const handleCreateProject = () => {
    openWizard();
  };

  const handleConnectGitHub = async () => {
    try {
      await connectGitHub();
    } catch (error) {
      console.error('Failed to connect GitHub:', error);
    }
  };

  const handleRefreshRepos = async () => {
    try {
      await fetchGitHubRepos();
    } catch (error) {
      console.error('Failed to refresh repos:', error);
    }
  };

  if (projectsLoading) {
    return (
      <div className="wf-monitor-tab-content">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wf-monitor-tab-content">
      {/* User Welcome Section */}
      <div className="wf-monitor-overview">
        <div className="wf-monitor-overview-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-wf-purple to-wf-pink rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-text">
                Welcome back, {user?.email?.split('@')[0] || 'Developer'}!
              </h4>
              <p className="text-sm text-muted">Ready to build something amazing?</p>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="wf-monitor-stat-item">
            <Code className="w-4 h-4 text-primary" />
            <span className="text-muted">Total Projects</span>
            <span className="wf-monitor-stat-value">{projectStats.totalProjects}</span>
          </div>
          <div className="wf-monitor-stat-item">
            <Activity className="w-4 h-4 text-success" />
            <span className="text-muted">Active</span>
            <span className="wf-monitor-stat-value">{projectStats.activeProjects}</span>
          </div>
          <div className="wf-monitor-stat-item">
            <CheckCircle className="w-4 h-4 text-info" />
            <span className="text-muted">Completed</span>
            <span className="wf-monitor-stat-value">{projectStats.completedProjects}</span>
          </div>
          <div className="wf-monitor-stat-item">
            <Github className="w-4 h-4 text-warning" />
            <span className="text-muted">GitHub</span>
            <span className="wf-monitor-stat-value">{projectStats.githubConnectedProjects}</span>
          </div>
        </div>
      </div>

      {/* GitHub Connection Status */}
      <div className="wf-monitor-section">
        <h5 className="wf-monitor-section-title">GitHub Integration</h5>
        
        {githubConnection.connected ? (
          <div className="wf-monitor-github-connected">
            <div className="flex items-center gap-3 p-4 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-success">
                {githubConnection.avatar_url ? (
                  <img 
                    src={githubConnection.avatar_url} 
                    alt={githubConnection.username || 'GitHub User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Github className="w-5 h-5 text-white m-2.5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-text">Connected to GitHub</span>
                </div>
                <p className="text-xs text-muted">@{githubConnection.username}</p>
              </div>
              <button
                onClick={handleRefreshRepos}
                className="p-2 text-muted hover:text-text transition-colors rounded-md hover:bg-white/5"
                title="Refresh repositories"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
            
            {githubConnection.repos.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted mb-2">
                  {githubConnection.repos.length} repositories available
                </p>
                <div className="text-xs text-muted">
                  Last synced: {githubConnection.lastSync ? 
                    formatDate(githubConnection.lastSync.toISOString()) : 'Never'
                  }
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="wf-monitor-github-disconnected">
            <div className="p-6 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-lg text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h6 className="text-sm font-medium text-text mb-2">Connect to GitHub</h6>
              <p className="text-xs text-muted mb-4 leading-relaxed">
                Link your GitHub account to enable version control, 
                repository management, and seamless deployment workflows.
              </p>
              <button
                onClick={handleConnectGitHub}
                className="wf-btn wf-btn-glass text-xs px-4 py-2 flex items-center gap-2 mx-auto"
              >
                <Github className="w-3.5 h-3.5" />
                Connect GitHub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="wf-monitor-section">
        <div className="flex items-center justify-between mb-4">
          <h5 className="wf-monitor-section-title mb-0">Your Projects</h5>
          {projects.length > 0 && (
            <button
              onClick={handleCreateProject}
              className="text-xs text-primary hover:text-secondary transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          /* Empty State - Guided Project Creation */
          <div className="wf-monitor-empty-state">
            <div className="p-8 bg-glass-bg backdrop-blur-glass border-2 border-dashed border-glass-border rounded-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-wf-purple to-wf-pink rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <h6 className="text-lg font-semibold text-text mb-3">
                Ready to Build Your First Project?
              </h6>
              
              <p className="text-sm text-muted mb-6 leading-relaxed max-w-sm mx-auto">
                Let's start with our guided setup wizard. We'll help you define your project 
                requirements clearly to ensure the best possible results.
              </p>

              <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-info mb-1">Why We Ask for Details</p>
                    <p className="text-xs text-muted leading-relaxed">
                      Taking time to provide context and requirements helps our AI generate 
                      more accurate, maintainable code that actually solves your specific problems. 
                      This prevents the common "prototype-to-production" failure pattern.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateProject}
                className="wf-btn wf-btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Start Guided Setup
              </button>
              
              <p className="text-xs text-muted mt-4">
                Takes 5-10 minutes • Dramatically improves results
              </p>
            </div>
          </div>
        ) : (
          /* Project List */
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => {
              const StatusIcon = getProjectStatusIcon(project);
              const isActive = activeProject?.id === project.id;
              
              return (
                <div
                  key={project.id}
                  onClick={() => setActiveProject(project)}
                  className={`p-4 bg-glass-bg backdrop-blur-glass border rounded-lg cursor-pointer transition-all hover:bg-glass-hover ${
                    isActive ? 'border-primary bg-primary/5' : 'border-glass-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h6 className="text-sm font-medium text-text truncate mb-1">
                        {project.name}
                      </h6>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {project.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <StatusIcon 
                        className="w-4 h-4" 
                        style={{ color: getProjectStatusColor(project) }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(project.updated_at || project.created_at || '')}</span>
                      </div>
                      {project.project_type && (
                        <div className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          <span className="capitalize">{project.project_type}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {project.github_repo && (
                        <a
                          href={project.github_repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-muted hover:text-text transition-colors rounded"
                          title="View on GitHub"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-muted hover:text-text transition-colors rounded"
                          title="View Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tech Stack Pills */}
                  {project.tech_stack && Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.tech_stack.slice(0, 3).map((tech: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-0.5 bg-white/10 text-xs text-text rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/5 text-xs text-muted rounded-md">
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {projects.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-xs text-primary hover:text-secondary transition-colors">
                  View all {projects.length} projects
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {projects.length > 0 && (
        <div className="wf-monitor-section">
          <h5 className="wf-monitor-section-title">Quick Actions</h5>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCreateProject}
              className="p-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-lg hover:bg-glass-hover transition-all text-left"
            >
              <Plus className="w-4 h-4 text-primary mb-2" />
              <div className="text-xs font-medium text-text">New Project</div>
              <div className="text-xs text-muted">Start fresh</div>
            </button>
            
            <button
              onClick={() => {/* TODO: Open templates */}}
              className="p-3 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-lg hover:bg-glass-hover transition-all text-left"
            >
              <Star className="w-4 h-4 text-warning mb-2" />
              <div className="text-xs font-medium text-text">Templates</div>
              <div className="text-xs text-muted">Quick start</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}