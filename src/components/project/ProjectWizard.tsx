import React, { useState, useCallback, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Lightbulb,
  Target,
  Code,
  Palette,
  Github,
  Cloud,
  Zap,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { useProjectStore } from '../../state/projectStore';
import { useAuthStore } from '../../state/authStore';

const projectTypes = [
  {
    id: 'web' as const,
    name: 'Web Application',
    description: 'React, Vue, Angular, or vanilla web apps',
    icon: Code,
    examples: ['E-commerce site', 'Dashboard', 'Blog', 'Portfolio']
  },
  {
    id: 'mobile' as const,
    name: 'Mobile App',
    description: 'React Native, Flutter, or native mobile apps',
    icon: Zap,
    examples: ['iOS app', 'Android app', 'Cross-platform', 'PWA']
  },
  {
    id: 'desktop' as const,
    name: 'Desktop Application',
    description: 'Electron, Tauri, or native desktop apps',
    icon: Target,
    examples: ['Productivity tool', 'Game', 'Utility', 'Creative app']
  },
  {
    id: 'api' as const,
    name: 'API/Backend',
    description: 'REST APIs, GraphQL, microservices',
    icon: Cloud,
    examples: ['REST API', 'GraphQL', 'Microservice', 'Database API']
  }
];

const techStackOptions = {
  web: ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'SCSS', 'Next.js', 'Vite', 'Svelte'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Ionic', 'Xamarin'],
  desktop: ['Electron', 'Tauri', 'Qt', 'WPF', '.NET', 'Java', 'Python', 'Rust'],
  api: ['Node.js', 'Python', 'Go', 'Rust', 'Java', 'Express', 'FastAPI', 'Gin', 'Spring Boot', 'Django']
};

const featureOptions = [
  'User Authentication', 'Database Integration', 'Real-time Updates', 'File Upload',
  'Payment Processing', 'Email Integration', 'Push Notifications', 'Analytics',
  'Search Functionality', 'Admin Dashboard', 'API Integration', 'Testing Suite',
  'Responsive Design', 'SEO Optimization', 'Performance Monitoring', 'Security Features'
];

const designStyles = [
  'Modern & Minimal', 'Bold & Colorful', 'Professional & Corporate', 'Creative & Artistic',
  'Dark & Sleek', 'Light & Airy', 'Retro & Vintage', 'Futuristic & Tech'
];

const complexityLevels = [
  { id: 'simple', name: 'Simple', description: 'Basic functionality, few features', time: '1-2 weeks' },
  { id: 'moderate', name: 'Moderate', description: 'Multiple features, some complexity', time: '1-2 months' },
  { id: 'complex', name: 'Complex', description: 'Advanced features, high complexity', time: '3+ months' }
];

export function ProjectWizard() {
  const { 
    wizardOpen, 
    wizardStep, 
    wizardSteps, 
    wizardData, 
    wizardLoading,
    wizardError,
    closeWizard,
    nextWizardStep,
    prevWizardStep,
    updateWizardData,
    submitWizard,
    clearWizardError,
    githubConnection
  } = useProjectStore();
  
  const { user } = useAuthStore();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Memoize current step to prevent recalculation
  const currentStep = useMemo(() => wizardSteps[wizardStep], [wizardSteps, wizardStep]);
  const isLastStep = useMemo(() => wizardStep === wizardSteps.length - 1, [wizardStep, wizardSteps.length]);

  // Memoize validation function to prevent recreation on every render
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep?.id) {
      case 'basics':
        if (!wizardData.name.trim()) {
          newErrors.name = 'Project name is required';
        }
        if (!wizardData.project_type) {
          newErrors.project_type = 'Please select a project type';
        }
        break;
        
      case 'context':
        if (!wizardData.problemStatement.trim()) {
          newErrors.problemStatement = 'Problem statement is required for accuracy';
        }
        if (!wizardData.targetAudience.trim()) {
          newErrors.targetAudience = 'Target audience helps us understand your users';
        }
        if (wizardData.primaryGoals.length === 0) {
          newErrors.primaryGoals = 'Please select at least one primary goal';
        }
        break;
        
      case 'technical':
        if (wizardData.tech_stack.length === 0) {
          newErrors.tech_stack = 'Please select at least one technology';
        }
        break;
    }
    
    // Only update errors if they've actually changed
    const hasErrors = Object.keys(newErrors).length > 0;
    const errorsChanged = JSON.stringify(newErrors) !== JSON.stringify(localErrors);
    
    if (errorsChanged) {
      setLocalErrors(newErrors);
    }
    
    return !hasErrors;
  }, [currentStep?.id, wizardData, localErrors]);

  // Memoize canProceed to prevent recalculation
  const canProceed = useMemo(() => validateCurrentStep(), [validateCurrentStep]);

  // Memoize handlers to prevent recreation
  const handleNext = useCallback(() => {
    if (canProceed) {
      if (isLastStep) {
        handleSubmit();
      } else {
        nextWizardStep();
      }
    }
  }, [canProceed, isLastStep, nextWizardStep]);

  const handleSubmit = useCallback(async () => {
    try {
      await submitWizard();
    } catch (error) {
      // Error is handled by the store
    }
  }, [submitWizard]);

  // Memoize array toggle function
  const toggleArrayItem = useCallback((array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  }, []);

  // Memoize update handlers to prevent recreation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateWizardData({ name: e.target.value });
  }, [updateWizardData]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateWizardData({ description: e.target.value });
  }, [updateWizardData]);

  const handleProjectTypeChange = useCallback((type: 'web' | 'mobile' | 'desktop' | 'api') => {
    updateWizardData({ project_type: type });
  }, [updateWizardData]);

  const handleProblemStatementChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateWizardData({ problemStatement: e.target.value });
  }, [updateWizardData]);

  const handleTargetAudienceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateWizardData({ targetAudience: e.target.value });
  }, [updateWizardData]);

  const handlePrimaryGoalToggle = useCallback((goal: string) => {
    updateWizardData({ 
      primaryGoals: toggleArrayItem(wizardData.primaryGoals, goal) 
    });
  }, [updateWizardData, toggleArrayItem, wizardData.primaryGoals]);

  const handleTechStackToggle = useCallback((tech: string) => {
    updateWizardData({ 
      tech_stack: toggleArrayItem(wizardData.tech_stack, tech) 
    });
  }, [updateWizardData, toggleArrayItem, wizardData.tech_stack]);

  const handleFeatureToggle = useCallback((feature: string) => {
    updateWizardData({ 
      features: toggleArrayItem(wizardData.features, feature) 
    });
  }, [updateWizardData, toggleArrayItem, wizardData.features]);

  const renderStepContent = useCallback(() => {
    switch (currentStep?.id) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">Tell Us About Your Project</h3>
              <p className="text-muted">Let's start with the basics to understand what you want to build.</p>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={wizardData.name}
                onChange={handleNameChange}
                className="w-full p-3 bg-glass-bg border border-glass-border rounded-lg text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="My Awesome Project"
              />
              {localErrors.name && (
                <p className="text-error text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localErrors.name}
                </p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Brief Description
              </label>
              <textarea
                value={wizardData.description}
                onChange={handleDescriptionChange}
                rows={3}
                className="w-full p-3 bg-glass-bg border border-glass-border rounded-lg text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-vertical"
                placeholder="A brief description of what your project does..."
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Project Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = wizardData.project_type === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleProjectTypeChange(type.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-glass-border bg-glass-bg hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                        <div>
                          <h4 className="font-medium text-text mb-1">{type.name}</h4>
                          <p className="text-sm text-muted mb-2">{type.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {type.examples.slice(0, 2).map((example, i) => (
                              <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted">
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {localErrors.project_type && (
                <p className="text-error text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localErrors.project_type}
                </p>
              )}
            </div>
          </div>
        );

      case 'context':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">Context & Requirements</h3>
              <p className="text-muted">Help us understand your goals so we can provide better guidance.</p>
            </div>

            <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info mb-1">Why This Matters</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Clear requirements help our AI generate more accurate, maintainable code. 
                    This prevents the "works in demo, fails in production" problem.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                What problem does this project solve? *
              </label>
              <textarea
                value={wizardData.problemStatement}
                onChange={handleProblemStatementChange}
                rows={4}
                className="w-full p-3 bg-glass-bg border border-glass-border rounded-lg text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-vertical"
                placeholder="Describe the specific problem or need your project addresses..."
              />
              {localErrors.problemStatement && (
                <p className="text-error text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localErrors.problemStatement}
                </p>
              )}
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Who is your target audience? *
              </label>
              <input
                type="text"
                value={wizardData.targetAudience}
                onChange={handleTargetAudienceChange}
                className="w-full p-3 bg-glass-bg border border-glass-border rounded-lg text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g., Small business owners, Students, Developers..."
              />
              {localErrors.targetAudience && (
                <p className="text-error text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localErrors.targetAudience}
                </p>
              )}
            </div>

            {/* Primary Goals */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Primary Goals *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Increase efficiency', 'Save time', 'Reduce costs', 'Improve user experience',
                  'Automate processes', 'Generate revenue', 'Solve specific problem', 'Learn new skills',
                  'Build portfolio', 'Start a business', 'Help others', 'Personal project'
                ].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handlePrimaryGoalToggle(goal)}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      wizardData.primaryGoals.includes(goal)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-glass-border bg-glass-bg text-text hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {wizardData.primaryGoals.includes(goal) && (
                        <Check className="w-4 h-4" />
                      )}
                      <span className="text-sm">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>
              {localErrors.primaryGoals && (
                <p className="text-error text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localErrors.primaryGoals}
                </p>
              )}
            </div>

            {/* Success Metrics */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                How will you measure success?
              </label>
              <textarea
                value={wizardData.successMetrics}
                onChange={(e) => updateWizardData({ successMetrics: e.target.value })}
                rows={3}
                className="w-full p-3 bg-glass-bg border border-glass-border rounded-lg text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-vertical"
                placeholder="e.g., User adoption rate, time saved, revenue generated..."
              />
            </div>
          </div>
        );

      case 'technical':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Code className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">Technical Details</h3>
              <p className="text-muted">Choose your preferred technologies and features.</p>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Technology Stack *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {techStackOptions[wizardData.project_type].map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleTechStackToggle(tech)}
                    className={`p-2 text-sm border rounded-lg transition-all ${
                      wizardData.tech_stack.includes(tech)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-glass-border bg-glass-bg text-text hover:border-primary/50'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
              {localErrors.tech_stack && (
                <p className="text-error text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {localErrors.tech_stack}
                </p>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Desired Features
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {featureOptions.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`p-3 text-left text-sm border rounded-lg transition-all ${
                      wizardData.features.includes(feature)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-glass-border bg-glass-bg text-text hover:border-primary/50'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity Estimation */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Estimated Complexity
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {complexityLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => updateWizardData({ estimatedComplexity: level.id as any })}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      wizardData.estimatedComplexity === level.id
                        ? 'border-primary bg-primary/10'
                        : 'border-glass-border bg-glass-bg hover:border-primary/50'
                    }`}
                  >
                    <h4 className="font-medium text-text mb-1">{level.name}</h4>
                    <p className="text-sm text-muted mb-2">{level.description}</p>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Clock className="w-3 h-3" />
                      {level.time}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  }, [
    currentStep?.id, 
    wizardData, 
    localErrors, 
    handleNameChange,
    handleDescriptionChange,
    handleProjectTypeChange,
    handleProblemStatementChange,
    handleTargetAudienceChange,
    handlePrimaryGoalToggle,
    handleTechStackToggle,
    handleFeatureToggle,
    updateWizardData
  ]);

  if (!wizardOpen) return null;

  return (
    <Dialog open={wizardOpen} onClose={closeWizard} className="wf-glass-frosted">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <div>
            <h2 className="text-xl font-semibold text-text">Project Setup Wizard</h2>
            <p className="text-sm text-muted">
              Step {wizardStep + 1} of {wizardSteps.length}: {currentStep?.title}
            </p>
          </div>
          <button
            onClick={closeWizard}
            className="p-2 text-muted hover:text-text transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-glass-border">
          <div className="flex items-center gap-2 mb-2">
            {wizardSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index < wizardStep ? 'bg-success text-white' :
                  index === wizardStep ? 'bg-primary text-white' :
                  'bg-glass-bg border border-glass-border text-muted'
                }`}>
                  {index < wizardStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < wizardSteps.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full transition-all ${
                    index < wizardStep ? 'bg-success' : 'bg-glass-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-xs text-muted">{currentStep?.description}</div>
        </div>

        {/* Error Display */}
        {wizardError && (
          <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error">Error</p>
                <p className="text-xs text-muted">{wizardError}</p>
              </div>
              <button
                onClick={clearWizardError}
                className="ml-auto p-1 text-error hover:text-error/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-glass-border">
          <button
            onClick={prevWizardStep}
            disabled={wizardStep === 0}
            className="wf-btn wf-btn-glass flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-xs text-muted">
            {wizardStep + 1} of {wizardSteps.length} steps
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed || wizardLoading}
            className="wf-btn wf-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wizardLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : isLastStep ? (
              <>
                <Zap className="w-4 h-4" />
                Create Project
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}