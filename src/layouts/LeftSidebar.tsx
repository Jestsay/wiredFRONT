import React from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  GraduationCap, 
  Image, 
  MessageSquare, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react';
import { useGlobalStore } from '../state/globalStore';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', current: true },
  { name: 'Development', icon: Code2, href: '/development', current: false },
  { name: 'Training', icon: GraduationCap, href: '/training', current: false },
  { name: 'Gallery', icon: Image, href: '/gallery', current: false },
  { name: 'Chat', icon: MessageSquare, href: '/chat', current: false },
  { name: 'Admin', icon: Shield, href: '/admin', current: false },
];

export function LeftSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useGlobalStore();

  return (
    <aside className="wf-sidebar" data-zone="sidebar">
      <div className="wf-sidebar-content">
        {/* Header */}
        <div className="wf-sidebar-header">
          <div className="wf-sidebar-header-content">
            {!sidebarCollapsed && (
              <div className="wf-sidebar-workspace">
                <div className="wf-sidebar-workspace-logo wf-animate-glow-subtle" />
                <div className="wf-sidebar-workspace-info">
                  <h3>Workspace</h3>
                  <p>PULSE OS</p>
                </div>
              </div>
            )}
            
            <button
              onClick={toggleSidebar}
              className="wf-sidebar-toggle wf-hover-scale wf-focus-ring"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="wf-sidebar-nav">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`wf-sidebar-nav-item ${item.current ? 'active' : ''}`}
                style={{
                  animationDelay: `${(index + 1) * 0.1}s`
                }}
                aria-label={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <span className="wf-sidebar-nav-item-text">
                    {item.name}
                  </span>
                )}
                
                {/* Active Indicator */}
                {item.current && !sidebarCollapsed && (
                  <div className="wf-sidebar-nav-item-indicator wf-animate-pulse" />
                )}
              </a>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="wf-sidebar-status">
          {!sidebarCollapsed ? (
            <div className="wf-sidebar-status-card wf-animate-glow-subtle">
              <div className="wf-sidebar-status-header">
                <Activity className="w-4 h-4 text-primary wf-animate-pulse" />
                <span>System Status</span>
              </div>
              
              <div className="wf-sidebar-status-list">
                <div className="wf-sidebar-status-item">
                  <span className="wf-sidebar-status-item-label">PULSE OS</span>
                  <div className="wf-sidebar-status-item-value">
                    <div className="wf-sidebar-status-dot online" />
                    <span style={{ color: 'var(--color-success)' }}>Online</span>
                  </div>
                </div>
                
                <div className="wf-sidebar-status-item">
                  <span className="wf-sidebar-status-item-label">AI Services</span>
                  <div className="wf-sidebar-status-item-value">
                    <div className="wf-sidebar-status-dot online" />
                    <span style={{ color: 'var(--color-success)' }}>Ready</span>
                  </div>
                </div>
                
                <div className="wf-sidebar-status-item">
                  <span className="wf-sidebar-status-item-label">Database</span>
                  <div className="wf-sidebar-status-item-value">
                    <div className="wf-sidebar-status-dot online" />
                    <span style={{ color: 'var(--color-success)' }}>Connected</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="wf-sidebar-status-dot online" />
              <div className="w-2 h-2 bg-primary rounded-full wf-animate-pulse" />
              <div className="w-2 h-2 bg-success rounded-full wf-animate-pulse" />
            </div>
          )}
        </div>

        {/* Version Info */}
        {!sidebarCollapsed && (
          <div className="wf-sidebar-version">
            <p>WIRED|FRONT</p>
            <p>v1.0.0-alpha</p>
          </div>
        )}
      </div>
    </aside>
  );
}