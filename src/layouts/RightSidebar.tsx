import React, { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Activity,
  AlertCircle,
  Settings,
  Zap,
  Monitor,
  FileText,
  Bell,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Server,
  Globe,
  Shield,
  Code,
  User,
} from 'lucide-react';
import { useGlobalStore } from '../state/globalStore';
import { useAuthStore } from '../state/authStore';
import { useProjectStore } from '../state/projectStore';
import { supabase } from '../api/supabase';
import { createRateLimitedCall } from '../state/rateLimiter';
import {
  activeTabAtom,
  currentTimeAtom,
  systemMetricsAtom,
  databaseStatsAtom,
  connectionStatusAtom,
  systemHealthAtom,
  alertCountAtom,
  performanceScoreAtom,
  tabContentVisibilityAtom,
  autoRefreshEnabledAtom,
  realTimeMetricsEnabledAtom,
  performanceAlertsEnabledAtom
} from '../state/monitorStore';
import { ProjectOverview } from '../components/project/ProjectOverview';
import { ProjectWizard } from '../components/project/ProjectWizard';

const tabs = [
  { id: 'overview', name: 'Overview', icon: User },
  { id: 'status', name: 'Status', icon: Monitor },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp },
  { id: 'logs', name: 'Logs', icon: FileText },
  { id: 'alerts', name: 'Alerts', icon: Bell },
  { id: 'settings', name: 'Settings', icon: Settings },
];

// Rate-limited data fetching functions
const fetchDatabaseStatsRateLimited = createRateLimitedCall(
  'database-stats',
  async () => {
    // Test connection first
    const { error: connectionError } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      throw new Error('Database connection failed');
    }

    // Fetch all stats in parallel using proper relationships
    const [projectCount, userCount, activityCount, hurdleCount, recentActivities] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('project_activities').select('*', { count: 'exact', head: true }),
      supabase.from('project_hurdles').select('*', { count: 'exact', head: true }),
      // Use the enriched view instead of complex joins
      supabase
        .from('v_project_activities_enriched')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return {
      totalProjects: projectCount.count || 0,
      totalUsers: userCount.count || 0,
      totalActivities: activityCount.count || 0,
      totalHurdles: hurdleCount.count || 0,
      recentActivities: recentActivities.data || []
    };
  },
  { retryOnLimit: true, maxRetries: 2 }
);

const updateSystemMetricsRateLimited = createRateLimitedCall(
  'system-metrics',
  async () => {
    // Get real browser performance metrics
    let memoryUsage = 0;
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      memoryUsage = Math.round((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100);
    }

    // CPU estimation based on performance timing
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
      Math.random();
    }
    const end = performance.now();
    const cpuLoad = Math.min(Math.round((end - start) / 10), 100);
    
    // Network estimation
    const connection = (navigator as any).connection;
    const networkSpeed = connection ? Math.round(connection.downlink || 10) : 10;
    
    // Storage estimation
    let storageUsage = 0;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.usage) {
          storageUsage = Math.round((estimate.usage / estimate.quota) * 100);
        }
      } catch (error) {
        console.warn('Storage estimation failed:', error);
      }
    }

    return {
      cpu: cpuLoad,
      memory: memoryUsage,
      storage: storageUsage,
      network: networkSpeed,
      lastUpdated: new Date()
    };
  },
  { retryOnLimit: false }
);

export function RightSidebar() {
  // Jotai atoms for UI state (read-only derivatives)
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [systemMetrics, setSystemMetrics] = useAtom(systemMetricsAtom);
  const [databaseStats, setDatabaseStats] = useAtom(databaseStatsAtom);
  const [connectionStatus, setConnectionStatus] = useAtom(connectionStatusAtom);
  
  // Read-only derived state
  const systemHealth = useAtomValue(systemHealthAtom);
  const alertCount = useAtomValue(alertCountAtom);
  const performanceScore = useAtomValue(performanceScoreAtom);
  const tabVisibility = useAtomValue(tabContentVisibilityAtom);
  
  // Settings atoms
  const autoRefreshEnabled = useAtomValue(autoRefreshEnabledAtom);
  const realTimeMetricsEnabled = useAtomValue(realTimeMetricsEnabledAtom);
  const performanceAlertsEnabled = useAtomValue(performanceAlertsEnabledAtom);

  // Zustand for write operations only
  const { projects } = useGlobalStore();
  const { user } = useAuthStore();
  const { fetchProjects } = useProjectStore();

  // Initialize project data
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [setCurrentTime]);

  // Update system metrics with rate limiting
  useEffect(() => {
    if (!realTimeMetricsEnabled) return;

    const updateMetrics = async () => {
      try {
        const metrics = await updateSystemMetricsRateLimited();
        setSystemMetrics(metrics);
      } catch (error) {
        console.warn('System metrics update failed:', error);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [realTimeMetricsEnabled, setSystemMetrics]);

  // Update database stats with rate limiting
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const updateDatabaseStats = async () => {
      try {
        const stats = await fetchDatabaseStatsRateLimited();
        setDatabaseStats({
          ...stats,
          lastUpdated: new Date()
        });
        setConnectionStatus('online');
      } catch (error) {
        console.error('Database stats update failed:', error);
        setConnectionStatus('error');
      }
    };

    updateDatabaseStats();
    const interval = setInterval(updateDatabaseStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, setDatabaseStats, setConnectionStatus]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'var(--color-success)';
      case 'error': return 'var(--color-error)';
      default: return 'var(--color-muted)';
    }
  };

  const getMetricColor = (value: number, type: string) => {
    if (type === 'network') return 'primary';
    if (value < 50) return 'success';
    if (value < 80) return 'warning';
    return 'error';
  };

  const getMetricStatus = (value: number) => {
    if (value < 50) return 'healthy';
    if (value < 80) return 'moderate';
    return 'critical';
  };

  const renderTabContent = () => {
    if (tabVisibility.overview) {
      return <ProjectOverview />;
    }

    if (tabVisibility.status) {
      return (
        <div className="wf-monitor-tab-content">
          {/* System Overview */}
          <div className="wf-monitor-overview">
            <div className="wf-monitor-overview-header">
              <Zap className="w-5 h-5" />
              <h4>PULSE OS Status</h4>
              <div className="wf-monitor-time">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
            
            <div className="wf-monitor-overview-stats">
              <div className="wf-monitor-stat-item">
                <Users className="w-4 h-4" />
                <span>Total Users</span>
                <span className="wf-monitor-stat-value">{databaseStats.totalUsers}</span>
              </div>
              <div className="wf-monitor-stat-item">
                <Code className="w-4 h-4" />
                <span>Projects</span>
                <span className="wf-monitor-stat-value">{databaseStats.totalProjects}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="wf-monitor-metrics">
            <h5 className="wf-monitor-section-title">System Performance</h5>
            
            <div className="wf-monitor-metric">
              <div className="wf-monitor-metric-header">
                <div className="wf-monitor-metric-label">
                  <Cpu className="w-4 h-4 text-success" />
                  <span>CPU Usage</span>
                </div>
                <div className="wf-monitor-metric-values">
                  <span className="wf-monitor-metric-value">{systemMetrics.cpu}%</span>
                </div>
              </div>
              <div className="wf-monitor-progress">
                <div 
                  className={`wf-monitor-progress-bar ${getMetricColor(systemMetrics.cpu, 'cpu')}`} 
                  style={{ width: `${systemMetrics.cpu}%` }}
                />
              </div>
              <div className="wf-monitor-metric-status">
                <div className={`wf-monitor-status-dot ${getMetricStatus(systemMetrics.cpu)}`} />
                <span className="wf-monitor-status-text">{getMetricStatus(systemMetrics.cpu)}</span>
              </div>
            </div>

            <div className="wf-monitor-metric">
              <div className="wf-monitor-metric-header">
                <div className="wf-monitor-metric-label">
                  <HardDrive className="w-4 h-4 text-info" />
                  <span>Memory Usage</span>
                </div>
                <div className="wf-monitor-metric-values">
                  <span className="wf-monitor-metric-value">{systemMetrics.memory}%</span>
                </div>
              </div>
              <div className="wf-monitor-progress">
                <div 
                  className={`wf-monitor-progress-bar ${getMetricColor(systemMetrics.memory, 'memory')}`} 
                  style={{ width: `${systemMetrics.memory}%` }}
                />
              </div>
              <div className="wf-monitor-metric-status">
                <div className={`wf-monitor-status-dot ${getMetricStatus(systemMetrics.memory)}`} />
                <span className="wf-monitor-status-text">{getMetricStatus(systemMetrics.memory)}</span>
              </div>
            </div>

            <div className="wf-monitor-metric">
              <div className="wf-monitor-metric-header">
                <div className="wf-monitor-metric-label">
                  <Database className="w-4 h-4 text-warning" />
                  <span>Storage</span>
                </div>
                <div className="wf-monitor-metric-values">
                  <span className="wf-monitor-metric-value">{systemMetrics.storage}%</span>
                </div>
              </div>
              <div className="wf-monitor-progress">
                <div 
                  className={`wf-monitor-progress-bar ${getMetricColor(systemMetrics.storage, 'storage')}`} 
                  style={{ width: `${systemMetrics.storage}%` }}
                />
              </div>
              <div className="wf-monitor-metric-status">
                <div className={`wf-monitor-status-dot ${getMetricStatus(systemMetrics.storage)}`} />
                <span className="wf-monitor-status-text">{getMetricStatus(systemMetrics.storage)}</span>
              </div>
            </div>

            <div className="wf-monitor-metric">
              <div className="wf-monitor-metric-header">
                <div className="wf-monitor-metric-label">
                  <Wifi className="w-4 h-4 text-primary" />
                  <span>Network</span>
                </div>
                <div className="wf-monitor-metric-values">
                  <span className="wf-monitor-metric-value">{systemMetrics.network} Mbps</span>
                </div>
              </div>
              <div className="wf-monitor-progress">
                <div 
                  className="wf-monitor-progress-bar primary" 
                  style={{ width: `${Math.min(systemMetrics.network * 10, 100)}%` }}
                />
              </div>
              <div className="wf-monitor-metric-status">
                <div className="wf-monitor-status-dot healthy" />
                <span className="wf-monitor-status-text">connected</span>
              </div>
            </div>
          </div>

          {/* System Services */}
          <div className="wf-monitor-services">
            <h5 className="wf-monitor-section-title">System Services</h5>
            <div className="wf-monitor-services-grid">
              <div className="wf-monitor-service-item">
                <div className="wf-monitor-service-header">
                  <Zap className="w-4 h-4" />
                  <span className="wf-monitor-service-name">PULSE OS Core</span>
                  <div className="wf-monitor-status-dot online" />
                </div>
                <div className="wf-monitor-service-uptime">
                  <span>Status: Active</span>
                </div>
              </div>

              <div className="wf-monitor-service-item">
                <div className="wf-monitor-service-header">
                  <Database className="w-4 h-4" />
                  <span className="wf-monitor-service-name">Supabase</span>
                  <div className={`wf-monitor-status-dot ${connectionStatus}`} />
                </div>
                <div className="wf-monitor-service-uptime">
                  <span>Status: {connectionStatus === 'online' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Offline'}</span>
                </div>
              </div>

              <div className="wf-monitor-service-item">
                <div className="wf-monitor-service-header">
                  <Shield className="w-4 h-4" />
                  <span className="wf-monitor-service-name">Authentication</span>
                  <div className={`wf-monitor-status-dot ${user ? 'online' : 'offline'}`} />
                </div>
                <div className="wf-monitor-service-uptime">
                  <span>Status: {user ? 'Authenticated' : 'Not Authenticated'}</span>
                </div>
              </div>

              <div className="wf-monitor-service-item">
                <div className="wf-monitor-service-header">
                  <Code className="w-4 h-4" />
                  <span className="wf-monitor-service-name">React App</span>
                  <div className="wf-monitor-status-dot online" />
                </div>
                <div className="wf-monitor-service-uptime">
                  <span>Status: Running</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tabVisibility.analytics) {
      return (
        <div className="wf-monitor-tab-content">
          <div className="wf-monitor-analytics">
            <h5 className="wf-monitor-section-title">Database Analytics</h5>
            
            <div className="wf-monitor-analytics-cards">
              <div className="wf-monitor-analytics-card">
                <div className="wf-monitor-analytics-card-header">
                  <Users className="w-5 h-5 text-success" />
                  <span>Total Users</span>
                </div>
                <div className="wf-monitor-analytics-card-value">{databaseStats.totalUsers}</div>
              </div>

              <div className="wf-monitor-analytics-card">
                <div className="wf-monitor-analytics-card-header">
                  <Code className="w-5 h-5 text-info" />
                  <span>Total Projects</span>
                </div>
                <div className="wf-monitor-analytics-card-value">{databaseStats.totalProjects}</div>
              </div>

              <div className="wf-monitor-analytics-card">
                <div className="wf-monitor-analytics-card-header">
                  <Activity className="w-5 h-5 text-warning" />
                  <span>Activities</span>
                </div>
                <div className="wf-monitor-analytics-card-value">{databaseStats.totalActivities}</div>
              </div>

              <div className="wf-monitor-analytics-card">
                <div className="wf-monitor-analytics-card-header">
                  <AlertTriangle className="w-5 h-5 text-error" />
                  <span>Hurdles</span>
                </div>
                <div className="wf-monitor-analytics-card-value">{databaseStats.totalHurdles}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tabVisibility.logs) {
      return (
        <div className="wf-monitor-tab-content">
          <div className="wf-monitor-logs">
            <h5 className="wf-monitor-section-title">Recent Database Activity</h5>
            
            <div className="wf-monitor-activity-list">
              {databaseStats.recentActivities.length > 0 ? (
                databaseStats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="wf-monitor-activity-item">
                    <div className="wf-monitor-activity-icon" style={{ color: 'var(--color-info)' }}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="wf-monitor-activity-content">
                      <div className="wf-monitor-activity-message">
                        {activity.description} in project "{activity.project_name || 'Unknown'}"
                      </div>
                      <div className="wf-monitor-activity-time">
                        {formatRelativeTime(activity.created_at)} by {activity.username || 'Unknown User'}
                      </div>
                    </div>
                    <div className="wf-monitor-activity-severity info" />
                  </div>
                ))
              ) : (
                <div className="wf-monitor-activity-item">
                  <div className="wf-monitor-activity-icon" style={{ color: 'var(--color-muted)' }}>
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="wf-monitor-activity-content">
                    <div className="wf-monitor-activity-message">No recent activities found</div>
                    <div className="wf-monitor-activity-time">Database is connected and ready</div>
                  </div>
                  <div className="wf-monitor-activity-severity info" />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (tabVisibility.alerts) {
      return (
        <div className="wf-monitor-tab-content">
          <div className="wf-monitor-alerts">
            <h5 className="wf-monitor-section-title">System Alerts</h5>
            
            <div className="wf-monitor-alert-summary">
              <div className="wf-monitor-alert-count">
                {connectionStatus === 'online' && alertCount === 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>All systems operational</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-error" />
                    <span>{alertCount} alert{alertCount !== 1 ? 's' : ''} detected</span>
                  </>
                )}
              </div>
            </div>

            {connectionStatus === 'error' && (
              <div className="wf-monitor-alert-item error">
                <AlertTriangle className="w-4 h-4" />
                <div className="wf-monitor-alert-content">
                  <div className="wf-monitor-alert-title">Database Connection Error</div>
                  <div className="wf-monitor-alert-description">Unable to connect to Supabase database</div>
                </div>
              </div>
            )}

            {systemMetrics.memory > 80 && (
              <div className="wf-monitor-alert-item warning">
                <AlertTriangle className="w-4 h-4" />
                <div className="wf-monitor-alert-content">
                  <div className="wf-monitor-alert-title">High Memory Usage</div>
                  <div className="wf-monitor-alert-description">Memory usage is at {systemMetrics.memory}%</div>
                </div>
              </div>
            )}

            {systemMetrics.cpu > 80 && (
              <div className="wf-monitor-alert-item warning">
                <AlertTriangle className="w-4 h-4" />
                <div className="wf-monitor-alert-content">
                  <div className="wf-monitor-alert-title">High CPU Usage</div>
                  <div className="wf-monitor-alert-description">CPU usage is at {systemMetrics.cpu}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (tabVisibility.settings) {
      return (
        <div className="wf-monitor-tab-content">
          <div className="wf-monitor-settings">
            <h5 className="wf-monitor-section-title">Monitor Settings</h5>
            
            <div className="wf-monitor-setting-group">
              <div className="wf-monitor-setting-item">
                <span>Auto-refresh (30s)</span>
                <div className={`wf-monitor-toggle ${autoRefreshEnabled ? 'active' : ''}`} />
              </div>
              <div className="wf-monitor-setting-item">
                <span>Real-time metrics</span>
                <div className={`wf-monitor-toggle ${realTimeMetricsEnabled ? 'active' : ''}`} />
              </div>
              <div className="wf-monitor-setting-item">
                <span>Database monitoring</span>
                <div className="wf-monitor-toggle active" />
              </div>
              <div className="wf-monitor-setting-item">
                <span>Performance alerts</span>
                <div className={`wf-monitor-toggle ${performanceAlertsEnabled ? 'active' : ''}`} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <aside className="wf-monitor" data-zone="monitor">
        <div className="wf-monitor-content">
          {/* Header */}
          <div className="wf-monitor-header">
            <div className="wf-monitor-header-content">
              <Activity className="w-5 h-5" />
              <h3>System Monitor</h3>
              <div className="wf-monitor-header-status">
                <div className={`wf-monitor-status-dot ${connectionStatus}`} />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="wf-monitor-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`wf-monitor-tab ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="wf-monitor-content-area">
            {renderTabContent()}
          </div>
        </div>
      </aside>

      {/* Project Wizard Modal */}
      <ProjectWizard />
    </>
  );
}