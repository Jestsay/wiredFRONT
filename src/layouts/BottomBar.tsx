import React from 'react';
import { MessageSquare, Cpu, HardDrive, Clock, Zap, Wifi } from 'lucide-react';

export function BottomBar() {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <footer className="wf-bottombar" data-zone="bottombar">
      <div className="wf-bottombar-content">
        {/* System Status (Left) */}
        <div className="wf-bottombar-left">
          <div className="wf-bottombar-status">
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU: 23%</span>
          </div>
          <div className="wf-bottombar-status">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Memory: 45%</span>
          </div>
          <div className="wf-bottombar-status">
            <Wifi className="w-3.5 h-3.5" />
            <span>Connected</span>
          </div>
          <div className="wf-bottombar-status">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Center Status - CLEAN PULSE OS */}
        <div className="wf-bottombar-center">
          <div className="wf-bottombar-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>PULSE OS Active</span>
          </div>
        </div>

        {/* Chat Toggle (Right) */}
        <div className="wf-bottombar-right">
          <button className="wf-bottombar-chat">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
            <div className="wf-bottombar-chat-indicator" />
          </button>
        </div>
      </div>
    </footer>
  );
}