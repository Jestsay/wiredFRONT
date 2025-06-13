import React from 'react';
import { ChevronDown, User, Zap, LogOut } from 'lucide-react';
import { useGlobalStore } from '../state/globalStore';
import { useAuthStore } from '../state/authStore';

export function TopBar() {
  const { activeProject } = useGlobalStore();
  const { user, profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="wf-topbar" data-zone="topbar">
      <div className="wf-topbar-content">
        {/* Brand Section (Left) */}
        <div className="wf-topbar-brand">
          <div className="wf-topbar-logo">
            <div className="absolute inset-0 bg-gradient-to-br from-wf-purple to-wf-pink animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-wf-violet to-wf-orange opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="wf-topbar-brand-text">
            <h1 className="wf-topbar-brand-title">WIRED|FRONT</h1>
            <p className="wf-topbar-brand-subtitle">PULSE OS</p>
          </div>

          {activeProject && (
            <>
              <div className="w-px h-8 bg-glass-border" />
              <div className="flex items-center gap-2 bg-glass-bg backdrop-blur-glass border border-glass-border rounded-lg p-2 hover:bg-glass-hover transition-colors">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-medium text-text">
                  {activeProject.name}
                </span>
                <ChevronDown className="w-4 h-4 text-muted" />
              </div>
            </>
          )}
        </div>

        {/* Navigation Section (Center) */}
        <nav className="wf-topbar-nav">
          <a href="/dashboard" className="wf-topbar-action active">
            Dashboard
          </a>
          <a href="/development" className="wf-topbar-action">
            Development
          </a>
          <a href="/training" className="wf-topbar-action">
            Training
          </a>
          <a href="/gallery" className="wf-topbar-action">
            Gallery
          </a>
          <a href="/chat" className="wf-topbar-action">
            Chat
          </a>
        </nav>

        {/* User Section (Right) */}
        <div className="wf-topbar-user">
          {user && (
            <div className="wf-topbar-profile">
              <div className="wf-topbar-avatar">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="wf-topbar-user-info">
                <p className="wf-topbar-user-name">
                  {profile?.username || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="wf-topbar-user-role">Developer</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="wf-topbar-logout"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}