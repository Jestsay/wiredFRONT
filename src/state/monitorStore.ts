import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// =====================================================
// JOTAI ATOMS FOR UI COMPONENT STATE (READ-ONLY)
// =====================================================

// Monitor UI State - Pure UI state, no write operations needed
export const activeTabAtom = atom<string>('status');
export const refreshIntervalAtom = atom<number>(30000); // 30 seconds
export const autoRefreshEnabledAtom = atomWithStorage('wf-monitor-auto-refresh', true);
export const realTimeMetricsEnabledAtom = atomWithStorage('wf-monitor-realtime', true);
export const performanceAlertsEnabledAtom = atomWithStorage('wf-monitor-alerts', true);

// System Metrics State - Derived from real data
export const systemMetricsAtom = atom({
  cpu: 0,
  memory: 0,
  storage: 0,
  network: 0,
  lastUpdated: new Date()
});

// Database Stats State - Derived from Supabase
export const databaseStatsAtom = atom({
  totalProjects: 0,
  totalUsers: 0,
  totalActivities: 0,
  totalHurdles: 0,
  recentActivities: [],
  lastUpdated: new Date()
});

// Connection Status State
export const connectionStatusAtom = atom<'online' | 'offline' | 'error'>('offline');

// Current Time State - Updates every second
export const currentTimeAtom = atom(new Date());

// Derived Atoms for Complex State
export const systemHealthAtom = atom((get) => {
  const metrics = get(systemMetricsAtom);
  const connection = get(connectionStatusAtom);
  
  if (connection !== 'online') return 'error';
  if (metrics.cpu > 80 || metrics.memory > 80) return 'warning';
  return 'healthy';
});

export const alertCountAtom = atom((get) => {
  const metrics = get(systemMetricsAtom);
  const connection = get(connectionStatusAtom);
  
  let count = 0;
  if (connection !== 'online') count++;
  if (metrics.cpu > 80) count++;
  if (metrics.memory > 80) count++;
  if (metrics.storage > 90) count++;
  
  return count;
});

// Performance Metrics Derived State
export const performanceScoreAtom = atom((get) => {
  const metrics = get(systemMetricsAtom);
  const cpuScore = Math.max(0, 100 - metrics.cpu);
  const memoryScore = Math.max(0, 100 - metrics.memory);
  const storageScore = Math.max(0, 100 - metrics.storage);
  
  return Math.round((cpuScore + memoryScore + storageScore) / 3);
});

// Monitor Settings State
export const monitorSettingsAtom = atom({
  refreshInterval: 30000,
  autoRefresh: true,
  realTimeMetrics: true,
  performanceAlerts: true,
  databaseMonitoring: true
});

// Tab Content Visibility State
export const tabContentVisibilityAtom = atom((get) => {
  const activeTab = get(activeTabAtom);
  return {
    status: activeTab === 'status',
    analytics: activeTab === 'analytics',
    logs: activeTab === 'logs',
    alerts: activeTab === 'alerts',
    settings: activeTab === 'settings'
  };
});