import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, DashboardStats, projectApi, ProjectWithMembers, taskApi, Task } from '../../api/services';
import { FolderKanban, CheckSquare, Clock, AlertCircle, ArrowRight, X, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const STATUS_COLORS: Record<string, string> = {
  'To Do':       '#6366f1',
  'In Progress': '#f59e0b',
  'Done':        '#10b981',
};
const PRIORITY_COLORS = ['#fbbf24', '#f97316', '#ef4444'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'projects' | 'tasks' | 'completed' | 'overdue' | null>(null);

  useEffect(() => {
    projectApi.getProjects()
      .then(d => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    const fetch = async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const [statsData, tasksData] = await Promise.all([
          dashboardApi.getStats(selectedProjectId),
          taskApi.getTasks(selectedProjectId),
        ]);
        setStats(statsData || null);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch { setStats(null); setTasks([]); }
      finally { if (showLoading) setIsLoading(false); }
    };
    fetch(true);
    const id = setInterval(() => fetch(false), 5000);
    return () => clearInterval(id);
  }, [selectedProjectId]);

  const statCards = [
    {
      name: t('projects'), type: 'projects' as const, value: stats?.total_projects || 0,
      icon: FolderKanban,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      name: t('tasks'), type: 'tasks' as const, value: stats?.total_tasks || 0,
      icon: CheckSquare,
      gradient: 'from-indigo-500 to-violet-600',
      bg: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-800/10',
      iconBg: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/30',
    },
    {
      name: 'Completed', type: 'completed' as const, value: stats?.completed_tasks || 0,
      icon: Clock,
      gradient: 'from-emerald-500 to-green-600',
      bg: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-800/10',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      name: 'Overdue', type: 'overdue' as const, value: stats?.overdue_tasks || 0,
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600',
      bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-800/10',
      iconBg: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  const statusData = stats?.tasks_by_status
    ? Object.entries(stats.tasks_by_status)
        .map(([k, v]) => ({ 
          name: k === 'todo' ? 'To Do' : k === 'in_progress' ? 'In Progress' : 'Done', 
          value: v 
        }))
        .filter(d => d.value > 0)
    : [];

  const priorityData = stats?.tasks_by_priority
    ? Object.entries(stats.tasks_by_priority)
        .map(([k, v]) => ({ name: k, value: v }))
        .filter(d => d.value > 0)
    : [];

  const total = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6 pb-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t('dashboard')} <span className="bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">Overview</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time insights across your team</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mr-2">Live</span>
          <select
            value={selectedProjectId || ''}
            onChange={e => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="block w-full sm:w-52 pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((item) => (
          <button
            key={item.name}
            onClick={() => { setModalType(item.type); setModalOpen(true); }}
            className={`relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-br ${item.bg} p-4 sm:p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full`}
          >
            {/* Decorative blob */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${item.iconBg} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${item.textColor}`}>{item.name}</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 tabular-nums">{item.value}</p>
              </div>
              <div className={`${item.iconBg} p-2 sm:p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-1 ${item.textColor} text-[11px] font-semibold`}>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              <span>View details</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Charts ── */}
      {stats && stats.total_tasks > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Tasks by Status */}
          <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Card header with gradient accent */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/60">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Tasks by Status</h2>
                <p className="text-xs text-gray-400 mt-0.5">{total} total tasks</p>
              </div>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="p-4 sm:p-5">
              {/* Donut chart */}
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius="45%" outerRadius="70%" paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                        return [`${value} tasks (${pct}%)`, name];
                      }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13, fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Percentage stat row — fixed grid, never overlaps */}
              <div className="grid mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800/60" style={{ gridTemplateColumns: `repeat(${statusData.length}, 1fr)` }}>
                {statusData.map((entry) => {
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  const color = STATUS_COLORS[entry.name] || '#8884d8';
                  return (
                    <div key={entry.name} className="relative flex flex-col items-center py-3 px-1 bg-gray-50/70 dark:bg-gray-800/20 border-r last:border-r-0 border-gray-100 dark:border-gray-800/60">
                      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl" style={{ background: color }} />
                      <span className="text-xl sm:text-2xl font-black tabular-nums" style={{ color }}>{pct}%</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center mt-0.5 leading-tight">{entry.name}</span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500">{entry.value}t</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tasks by Priority */}
          <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/60">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Tasks by Priority</h2>
                <p className="text-xs text-gray-400 mt-0.5">{priorityData.length} priority level{priorityData.length !== 1 ? 's' : ''}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="p-4 sm:p-5">
              <div className="h-52 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 8 }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13, fontWeight: 600 }}
                      formatter={(v: number) => [`${v} tasks`, 'Count']}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {priorityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Priority legend pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {priorityData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ borderColor: PRIORITY_COLORS[index % PRIORITY_COLORS.length] + '40', background: PRIORITY_COLORS[index % PRIORITY_COLORS.length] + '12' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[index % PRIORITY_COLORS.length] }} />
                    <span className="text-[11px] font-bold" style={{ color: PRIORITY_COLORS[index % PRIORITY_COLORS.length] }}>{entry.name}</span>
                    <span className="text-[11px] text-gray-400 font-semibold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No data to visualize</h3>
          <p className="mt-1 text-sm text-gray-400">Create tasks to see charts appear here.</p>
        </div>
      )}

      {/* ── Details Modal ── */}
      {modalOpen && modalType && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end sm:items-center justify-center min-h-screen px-4 pb-0 sm:pb-20 sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <div className="relative inline-block w-full align-bottom sm:align-middle bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 sm:max-w-2xl sm:my-8 overflow-hidden">
              {/* Modal header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {modalType === 'projects' ? '📁 Projects' : modalType === 'completed' ? '✅ Completed Tasks' : modalType === 'overdue' ? '⚠️ Overdue Tasks' : '📋 All Tasks'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                {modalType === 'projects' ? (
                  Array.isArray(projects) && projects.length > 0 ? projects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.client_name || 'No client'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${p.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {p.status || 'Active'}
                      </span>
                    </div>
                  )) : <p className="text-center text-gray-400 py-8">No projects found.</p>
                ) : (
                  (() => {
                    const filtered = tasks.filter(t => {
                      if (modalType === 'completed') return t.status === 'done';
                      if (modalType === 'overdue') return t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date();
                      return true;
                    });
                    return filtered.length > 0 ? filtered.map(t => (
                      <div key={t.id} className="flex items-start justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{t.title}</p>
                          {t.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${t.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : t.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                            {t.status === 'todo' ? 'To Do' : t.status === 'in_progress' ? 'In Progress' : 'Done'}
                          </span>
                          {t.due_date && <span className="text-[10px] text-gray-400">Due {new Date(t.due_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    )) : <p className="text-center text-gray-400 py-8">No tasks found.</p>;
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
