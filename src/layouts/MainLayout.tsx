import React from 'react';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomBar } from './BottomBar';
import { useGlobalStore } from '../state/globalStore';
import { cn } from '../utils/cn';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed, monitorVisible } = useGlobalStore();

  return (
    <div className={cn(
      "wf-layout",
      sidebarCollapsed && "sidebar-collapsed",
      !monitorVisible && "monitor-hidden"
    )}>
      <div className="wf-topbar">
        <TopBar />
      </div>
      
      <div className="wf-sidebar">
        <LeftSidebar />
      </div>
      
      <main className="wf-main">
        <div style={{
          height: '100%',
          overflowY: 'auto',
          background: 'var(--color-bg)'
        }}>
          {children}
        </div>
      </main>
      
      {monitorVisible && (
        <div className="wf-monitor">
          <RightSidebar />
        </div>
      )}
      
      <div className="wf-bottombar">
        <BottomBar />
      </div>
    </div>
  );
}

export default MainLayout;