import React, { useEffect, useState } from 'react';
import { Plus, Github, FolderOpen, Clock, Star, Zap, Code, Palette } from 'lucide-react';
import { useGlobalStore } from '../../state/globalStore';
import { useAuthStore } from '../../state/authStore';
import { ProjectSetupModal } from '../../domains/project-management/components/ProjectSetupModal';

export function DashboardPage() {
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const { projects, fetchProjects, setActiveProject, loading } = useGlobalStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  const handleSelectProject = (project: any) => {
    setActiveProject(project);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'var(--color-success)' : 'var(--color-muted)';
  };

  const getStatusBg = (isActive: boolean) => {
    return isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <Zap style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} /> : <Clock style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />;
  };

  return (
    <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      {/* Header */}
      <div className="wf-glass-raised rounded-xl" style={{ padding: 'var(--space-xl)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--font-bold)',
              background: 'var(--wf-text-gradient-animated)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 'var(--space-sm)'
            }}>
              Project Dashboard
            </h1>
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-muted)'
            }}>
              Select a project to continue your development journey, or start something new with PULSE OS.
            </p>
          </div>
          <div className="flex items-center" style={{
            gap: 'var(--space-sm)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-muted)'
          }}>
            <Zap style={{
              width: 'var(--text-sm)',
              height: 'var(--text-sm)',
              color: 'var(--color-primary)'
            }} className="wf-animate-pulse" />
            <span>PULSE OS Active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row" style={{ gap: 'var(--space-xl)' }}>
        <button
          onClick={() => setSetupModalOpen(true)}
          className="wf-btn wf-btn-primary wf-interactive wf-focus-ring"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}
        >
          <Plus style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
          Start New Project
        </button>
        
        <button className="wf-btn wf-btn-glass wf-interactive wf-focus-ring" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          <Github style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
          Import GitHub Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '2px solid var(--color-primary)',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              margin: '0 auto var(--space-lg) auto'
            }} className="wf-spin" />
            <p style={{ color: 'var(--color-muted)' }}>Loading projects...</p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
          gap: 'var(--space-2xl)'
        }}>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleSelectProject(project)}
              className="wf-card wf-interactive"
              style={{
                cursor: 'pointer',
                padding: 'var(--space-xl)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                {/* Project Header */}
                <div className="flex items-start justify-between">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <h3 style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text)'
                    }}>
                      {project.name}
                    </h3>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-muted)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: '0.5rem',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    textTransform: 'capitalize',
                    border: '1px solid',
                    color: getStatusColor(project.is_active || false),
                    background: getStatusBg(project.is_active || false),
                    borderColor: getStatusColor(project.is_active || false) + '30',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)'
                  }}>
                    {getStatusIcon(project.is_active || false)}
                    <span>{project.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="flex items-center" style={{
                  gap: 'var(--space-xl)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-muted)'
                }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
                    <Clock style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                    <span>Updated {formatDate(project.updated_at || project.created_at || '')}</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
                    <Code style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                    <span>{project.project_type || 'Web'}</span>
                  </div>
                </div>

                {/* Tech Stack */}
                {project.tech_stack && Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
                  <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-muted)',
                      fontWeight: 'var(--font-medium)'
                    }}>
                      Tech Stack:
                    </span>
                    <div className="flex flex-wrap" style={{ gap: 'var(--space-xs)' }}>
                      {project.tech_stack.slice(0, 3).map((tech: string, index: number) => (
                        <span 
                          key={index}
                          style={{
                            padding: 'var(--space-xs) var(--space-sm)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.25rem',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text)'
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span style={{
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.25rem',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-muted)'
                        }}>
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Project Metrics */}
                <div style={{
                  paddingTop: 'var(--space-lg)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-muted)'
                }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
                    <Star style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                    <span>{project.like_count || 0} likes</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
                    <FolderOpen style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                    <span>{project.view_count || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Create New Card */}
          <div
            onClick={() => setSetupModalOpen(true)}
            className="wf-card wf-interactive"
            style={{
              cursor: 'pointer',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              transition: 'all var(--transition-base) ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <div className="flex flex-col items-center justify-center" style={{
              paddingTop: 'var(--space-3xl)',
              paddingBottom: 'var(--space-3xl)',
              gap: 'var(--space-xl)'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'var(--wf-gradient-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Plus style={{
                  width: '2rem',
                  height: '2rem',
                  color: 'white'
                }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-md)'
                }}>
                  Create New Project
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-muted)',
                  lineHeight: 1.6
                }}>
                  Start your next app with structured guidance from PULSE OS
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Setup Modal */}
      <ProjectSetupModal
        open={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </div>
  );
}

export default DashboardPage;