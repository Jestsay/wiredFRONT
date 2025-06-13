import React, { useState } from 'react';
import { X, Plus, Github, Folder, Zap, Code, Palette, Settings } from 'lucide-react';
import { Dialog } from '../../../components/ui/Dialog';
import { useGlobalStore } from '../../../state/globalStore';
import { useAuthStore } from '../../../state/authStore';

interface ProjectSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectSetupModal({ open, onClose }: ProjectSetupModalProps) {
  const [step, setStep] = useState<'type' | 'details' | 'config'>('type');
  const [projectType, setProjectType] = useState<'web' | 'mobile' | 'desktop' | 'api'>('web');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubRepo: '',
    techStack: [] as string[],
    features: [] as string[],
    visibility: 'private' as 'private' | 'public' | 'shared'
  });

  const { createProject, loading } = useGlobalStore();
  const { user } = useAuthStore();

  const projectTypes = [
    {
      id: 'web' as const,
      name: 'Web Application',
      description: 'React, Vue, Angular, or vanilla web apps',
      icon: Code,
      color: 'var(--color-primary)',
      gradient: 'linear-gradient(135deg, var(--wf-purple), var(--wf-violet))'
    },
    {
      id: 'mobile' as const,
      name: 'Mobile App',
      description: 'React Native, Flutter, or native mobile apps',
      icon: Zap,
      color: 'var(--color-info)',
      gradient: 'linear-gradient(135deg, var(--wf-violet), var(--wf-pink))'
    },
    {
      id: 'desktop' as const,
      name: 'Desktop Application',
      description: 'Electron, Tauri, or native desktop apps',
      icon: Settings,
      color: 'var(--color-warning)',
      gradient: 'linear-gradient(135deg, var(--wf-pink), var(--wf-orange))'
    },
    {
      id: 'api' as const,
      name: 'API/Backend',
      description: 'REST APIs, GraphQL, microservices',
      icon: Folder,
      color: 'var(--color-success)',
      gradient: 'linear-gradient(135deg, var(--wf-orange), var(--wf-purple))'
    }
  ];

  const techStackOptions = {
    web: ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'SCSS', 'Next.js', 'Vite'],
    mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Ionic'],
    desktop: ['Electron', 'Tauri', 'Qt', 'WPF', '.NET', 'Java'],
    api: ['Node.js', 'Python', 'Go', 'Rust', 'Java', 'Express', 'FastAPI', 'Gin', 'Spring Boot']
  };

  const featureOptions = [
    'Authentication', 'Database Integration', 'Real-time Updates', 'File Upload',
    'Payment Processing', 'Email Integration', 'Push Notifications', 'Analytics',
    'Search Functionality', 'Admin Dashboard', 'API Integration', 'Testing Suite'
  ];

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        github_repo: formData.githubRepo || null,
        project_type: projectType,
        tech_stack: formData.techStack,
        features: formData.features,
        visibility: formData.visibility,
        user_id: user.id
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const resetForm = () => {
    setStep('type');
    setProjectType('web');
    setFormData({
      name: '',
      description: '',
      githubRepo: '',
      techStack: [],
      features: [],
      visibility: 'private'
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 'type':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-sm)'
              }}>
                Choose Your Project Type
              </h3>
              <p style={{
                color: 'var(--color-muted)',
                fontSize: 'var(--text-sm)'
              }}>
                Select the type of application you want to build
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-lg)'
            }}>
              {projectTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = projectType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setProjectType(type.id)}
                    className="wf-interactive wf-focus-ring"
                    style={{
                      padding: 'var(--space-xl)',
                      borderRadius: '1rem',
                      border: isSelected 
                        ? '2px solid var(--color-primary)' 
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected 
                        ? 'rgba(94, 234, 212, 0.1)' 
                        : 'rgba(17, 19, 24, 0.6)',
                      backdropFilter: 'blur(12px)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base) ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      background: type.gradient,
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-lg)'
                    }}>
                      <Icon style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        color: 'white'
                      }} />
                    </div>
                    
                    <h4 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text)',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      {type.name}
                    </h4>
                    
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-muted)',
                      lineHeight: 1.5
                    }}>
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep('details')}
              className="wf-btn wf-btn-primary wf-interactive wf-focus-ring"
              style={{
                alignSelf: 'flex-end',
                padding: 'var(--space-md) var(--space-xl)'
              }}
            >
              Continue
            </button>
          </div>
        );

      case 'details':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-sm)'
              }}>
                Project Details
              </h3>
              <p style={{
                color: 'var(--color-muted)',
                fontSize: 'var(--text-sm)'
              }}>
                Tell us about your {projectTypes.find(t => t.id === projectType)?.name.toLowerCase()}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {/* Project Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'var(--input-bg)',
                    border: 'var(--input-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-base)',
                    backdropFilter: 'var(--input-backdrop)'
                  }}
                  placeholder="Enter your project name"
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'var(--input-bg)',
                    border: 'var(--input-border)',
                    borderRadius: '0.75rem',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-base)',
                    backdropFilter: 'var(--input-backdrop)',
                    resize: 'vertical'
                  }}
                  placeholder="Describe what your project does..."
                />
              </div>

              {/* GitHub Repository */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  GitHub Repository (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Github style={{
                    position: 'absolute',
                    left: 'var(--space-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 'var(--text-lg)',
                    height: 'var(--text-lg)',
                    color: 'var(--color-muted)'
                  }} />
                  <input
                    type="url"
                    value={formData.githubRepo}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubRepo: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 'var(--space-md) var(--space-md) var(--space-md) 3rem',
                      background: 'var(--input-bg)',
                      border: 'var(--input-border)',
                      borderRadius: '0.75rem',
                      color: 'var(--color-text)',
                      fontSize: 'var(--text-base)',
                      backdropFilter: 'var(--input-backdrop)'
                    }}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  Project Visibility
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                  {[
                    { value: 'private', label: 'Private', desc: 'Only you can see this project' },
                    { value: 'shared', label: 'Shared', desc: 'Share with specific collaborators' },
                    { value: 'public', label: 'Public', desc: 'Anyone can view this project' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, visibility: option.value as any }))}
                      className="wf-interactive wf-focus-ring"
                      style={{
                        flex: 1,
                        padding: 'var(--space-md)',
                        borderRadius: '0.75rem',
                        border: formData.visibility === option.value
                          ? '2px solid var(--color-primary)'
                          : '2px solid rgba(255, 255, 255, 0.1)',
                        background: formData.visibility === option.value
                          ? 'rgba(94, 234, 212, 0.1)'
                          : 'rgba(17, 19, 24, 0.6)',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text)',
                        marginBottom: 'var(--space-xs)'
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-muted)'
                      }}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStep('type')}
                className="wf-btn wf-btn-glass wf-interactive wf-focus-ring"
                style={{ padding: 'var(--space-md) var(--space-xl)' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep('config')}
                disabled={!formData.name.trim()}
                className="wf-btn wf-btn-primary wf-interactive wf-focus-ring"
                style={{ 
                  padding: 'var(--space-md) var(--space-xl)',
                  opacity: !formData.name.trim() ? 0.6 : 1
                }}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'config':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-sm)'
              }}>
                Configure Your Project
              </h3>
              <p style={{
                color: 'var(--color-muted)',
                fontSize: 'var(--text-sm)'
              }}>
                Select technologies and features for your project
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
              {/* Tech Stack */}
              <div>
                <h4 style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-md)'
                }}>
                  Technology Stack
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-sm)'
                }}>
                  {techStackOptions[projectType].map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechStack(tech)}
                      className="wf-interactive wf-focus-ring"
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: '0.5rem',
                        border: formData.techStack.includes(tech)
                          ? '1px solid var(--color-primary)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: formData.techStack.includes(tech)
                          ? 'rgba(94, 234, 212, 0.2)'
                          : 'rgba(17, 19, 24, 0.6)',
                        color: formData.techStack.includes(tech)
                          ? 'var(--color-primary)'
                          : 'var(--color-text)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-md)'
                }}>
                  Features & Integrations
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-sm)'
                }}>
                  {featureOptions.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className="wf-interactive wf-focus-ring"
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: '0.5rem',
                        border: formData.features.includes(feature)
                          ? '1px solid var(--color-primary)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: formData.features.includes(feature)
                          ? 'rgba(94, 234, 212, 0.2)'
                          : 'rgba(17, 19, 24, 0.6)',
                        color: formData.features.includes(feature)
                          ? 'var(--color-primary)'
                          : 'var(--color-text)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStep('details')}
                className="wf-btn wf-btn-glass wf-interactive wf-focus-ring"
                style={{ padding: 'var(--space-md) var(--space-xl)' }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="wf-btn wf-btn-primary wf-interactive wf-focus-ring"
                style={{
                  padding: 'var(--space-md) var(--space-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }} className="wf-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="wf-glass-frosted">
      <div style={{ maxWidth: '48rem', width: '100%' }}>
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-2xl)'
        }}>
          {['type', 'details', 'config'].map((stepName, index) => {
            const isActive = step === stepName;
            const isCompleted = ['type', 'details', 'config'].indexOf(step) > index;
            
            return (
              <React.Fragment key={stepName}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: isActive || isCompleted 
                    ? 'var(--wf-gradient-primary)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: isActive || isCompleted ? 'white' : 'var(--color-muted)'
                }}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div style={{
                    width: '3rem',
                    height: '2px',
                    background: isCompleted 
                      ? 'var(--color-primary)' 
                      : 'rgba(255, 255, 255, 0.1)'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </Dialog>
  );
}