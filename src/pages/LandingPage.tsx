import React, { useState } from 'react';
import { ArrowRight, Code, Zap, Shield, Target, Sparkles, Play, Github, Star } from 'lucide-react';
import { AuthModal } from '../domains/onboarding/components/AuthModal';
import { DataStreams } from '../components/effects/DataStreams';
import { FloatingCTA } from '../components/effects/FloatingCTA';

export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const features = [
    {
      icon: Code,
      title: 'Master Your Code',
      description: 'Learn real development skills through guided practice, not just AI generation.',
      gradient: 'from-wf-purple to-wf-pink',
    },
    {
      icon: Target,
      title: 'Structured Context',
      description: 'Our system ensures you define clear requirements before any code is generated.',
      gradient: 'from-wf-pink to-wf-violet',
    },
    {
      icon: Shield,
      title: 'Production Ready',
      description: 'Build apps that are maintainable, secure, and ready for real-world deployment.',
      gradient: 'from-wf-violet to-wf-orange',
    },
    {
      icon: Zap,
      title: 'AI Enhancement',
      description: 'Leverage AI as a tool, not a crutch, with built-in guardrails and best practices.',
      gradient: 'from-wf-orange to-wf-purple',
    },
  ];

  const stats = [
    { label: 'Projects Built', value: '10,000+', icon: Code },
    { label: 'Developers Trained', value: '5,000+', icon: Target },
    { label: 'Success Rate', value: '95%', icon: Star },
    { label: 'Production Apps', value: '2,500+', icon: Shield },
  ];

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="wf-landing-container">
      {/* Data Streams Background Effect */}
      <DataStreams />

      {/* Floating CTA Particle */}
      <FloatingCTA
        onLoginClick={() => openAuth('login')}
        onJoinClick={() => openAuth('register')}
      />

      {/* Animated Background Elements */}
      <div className="wf-bg-element wf-bg-element-1" />
      <div className="wf-bg-element wf-bg-element-2" />
      <div className="wf-bg-element wf-bg-element-3" />
      <div className="wf-bg-element wf-bg-element-4" />

      {/* Hero Section */}
      <div className="wf-hero-section">
        <div className="wf-hero-container">
          <div className="wf-hero-content">
            {/* Logo & Branding */}
            <div className="wf-brand-section">
              <div className="wf-brand-logo-container">
                <div className="wf-brand-logo">
                  <div className="wf-logo-gradient-1" />
                  <div className="wf-logo-gradient-2" />
                  <div className="wf-logo-icon">
                    <Sparkles className="wf-sparkles-icon" />
                  </div>
                </div>
                <div className="wf-brand-text">
                  <h1 className="wf-brand-title">WIRED|FRONT</h1>
                  <p className="wf-brand-subtitle">PULSE OS</p>
                </div>
              </div>

              {/* Main Headlines */}
              <div className="wf-headlines-section">
                <h1 className="wf-main-headline">
                  <span className="wf-headline-gradient">Build Your App.</span>
                  <br />
                  <span className="wf-headline-text">Master Your Code.</span>
                </h1>
                
                <p className="wf-tagline">
                  Building the Future Interface, Today.
                </p>
                
                <p className="wf-description">
                  Stop falling into the Prototype-to-Production Death Valley. 
                  WiredFront transforms "vibecoders" into real developers through structured learning 
                  and production-ready practices powered by our revolutionary PULSE OS.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="wf-cta-section">
                <button
                  onClick={() => openAuth('register')}
                  className="wf-btn wf-btn-primary wf-btn-cta"
                >
                  <ArrowRight className="wf-btn-icon" />
                  Start Your App Journey
                </button>
                
                <button
                  onClick={() => openAuth('login')}
                  className="wf-btn wf-btn-glass wf-btn-secondary"
                >
                  <Play className="wf-btn-icon" />
                  Join WiredFront
                </button>
              </div>

              {/* Stats Section */}
              <div className="wf-stats-grid">
                {stats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="wf-stat-card"
                    >
                      <div className="wf-stat-icon">
                        <StatIcon className="wf-icon" />
                      </div>
                      <div className="wf-stat-value">{stat.value}</div>
                      <div className="wf-stat-label">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Features Preview */}
            <div className="wf-features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="wf-feature-card"
                  >
                    <div className={`wf-feature-icon bg-gradient-to-br ${feature.gradient}`}>
                      <Icon className="wf-icon" />
                    </div>
                    <h3 className="wf-feature-title">
                      {feature.title}
                    </h3>
                    <p className="wf-feature-description">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Statement Section */}
      <div className="wf-problem-section">
        <div className="wf-problem-overlay" />
        <div className="wf-problem-container">
          <h2 className="wf-problem-title">
            The Problem We Solve
          </h2>
          
          <div className="wf-problem-grid">
            <div className="wf-problem-item">
              <div className="wf-problem-icon wf-problem-icon-death">
                <span className="wf-emoji">💀</span>
              </div>
              <h3 className="wf-problem-heading">Death Valley</h3>
              <p className="wf-problem-text">
                95% of prototype apps never reach production due to technical debt and poor architecture.
              </p>
            </div>
            
            <div className="wf-problem-item">
              <div className="wf-problem-icon wf-problem-icon-ai">
                <span className="wf-emoji">🤖</span>
              </div>
              <h3 className="wf-problem-heading">AI Dependency</h3>
              <p className="wf-problem-text">
                Over-reliance on AI without understanding leads to unmaintainable code and security issues.
              </p>
            </div>
            
            <div className="wf-problem-item">
              <div className="wf-problem-icon wf-problem-icon-vibe">
                <span className="wf-emoji">🎯</span>
              </div>
              <h3 className="wf-problem-heading">Vibe Coding</h3>
              <p className="wf-problem-text">
                Lack of structured requirements and planning leads to feature creep and project abandonment.
              </p>
            </div>
          </div>

          <button
            onClick={() => openAuth('register')}
            className="wf-btn wf-btn-primary wf-btn-cta"
          >
            Break the Cycle - Start Learning
          </button>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="wf-social-section">
        <div className="wf-social-container">
          <h2 className="wf-social-title">
            Trusted by Developers Worldwide
          </h2>
          
          <div className="wf-testimonials-grid">
            <div className="wf-testimonial-card">
              <div className="wf-testimonial-header">
                <div className="wf-testimonial-avatar wf-avatar-github">
                  <Github className="wf-icon" />
                </div>
                <div className="wf-testimonial-info">
                  <h4 className="wf-testimonial-name">Sarah Chen</h4>
                  <p className="wf-testimonial-role">Full-Stack Developer</p>
                </div>
              </div>
              <p className="wf-testimonial-text">
                "WiredFront transformed how I approach app development. The structured context capture 
                prevented me from falling into the usual prototype trap."
              </p>
            </div>
            
            <div className="wf-testimonial-card">
              <div className="wf-testimonial-header">
                <div className="wf-testimonial-avatar wf-avatar-star">
                  <Star className="wf-icon" />
                </div>
                <div className="wf-testimonial-info">
                  <h4 className="wf-testimonial-name">Marcus Rodriguez</h4>
                  <p className="wf-testimonial-role">Startup Founder</p>
                </div>
              </div>
              <p className="wf-testimonial-text">
                "Finally shipped my MVP to production! The PULSE OS guidance kept me focused 
                on building something real instead of just another demo."
              </p>
            </div>
            
            <div className="wf-testimonial-card">
              <div className="wf-testimonial-header">
                <div className="wf-testimonial-avatar wf-avatar-code">
                  <Code className="wf-icon" />
                </div>
                <div className="wf-testimonial-info">
                  <h4 className="wf-testimonial-name">Alex Thompson</h4>
                  <p className="wf-testimonial-role">Senior Engineer</p>
                </div>
              </div>
              <p className="wf-testimonial-text">
                "The best part? I actually understand the code I'm building now. 
                No more copy-paste programming from AI without comprehension."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}

export default LandingPage;