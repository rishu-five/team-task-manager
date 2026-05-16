import React, { useEffect, useState } from 'react';
import { taskApi, projectApi, Task, ProjectWithMembers } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { Plus } from 'lucide-react';

export const TasksBoard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({ 
    title: '', description: '', status: 'todo', priority: 'Medium', task_type: 'Task', story_points: 0, project_id: undefined, assigned_to_id: undefined 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [tasksData, projectsData] = await Promise.all([
        taskApi.getTasks(),
        projectApi.getProjects()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch tasks/projects', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: Task['status']) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      fetchData(false);
    } catch (error) {
      console.error('Failed to update task', error);
      setTasks(previousTasks); // Rollback
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskApi.createTask(newTask);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'Medium', task_type: 'Task', story_points: 0, project_id: undefined, assigned_to_id: undefined });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const columns: { title: string; status: Task['status'] }[] = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Done', status: 'done' }
  ];

  const filteredTasks = tasks.filter(task => {
    const search = searchTerm.toLowerCase();
    const taskKey = (task.task_key || `T${task.id.toString().padStart(4, '0')}`).toLowerCase();
    const creator = task.created_by?.full_name?.toLowerCase() || '';
    const assignee = task.assigned_to?.full_name?.toLowerCase() || 'unassigned';
    const title = task.title.toLowerCase();

    return taskKey.includes(search) || 
           creator.includes(search) || 
           assignee.includes(search) || 
           title.includes(search);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('tasks_board')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and search your team's lifecycle</p>
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-primary-500 focus:ring-0 transition-all placeholder-gray-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('create_issue')}
          </button>
        </div>
      </div>

      {/* Mobile: tab-style column switcher */}
      <div className="lg:hidden mb-4 flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {columns.map((col, idx) => (
          <button
            key={col.status}
            onClick={() => {
              const el = document.getElementById(`col-${col.status}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
              idx === 0 ? 'rounded-l-xl' : idx === columns.length - 1 ? 'rounded-r-xl' : ''
            } text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            {col.title}
            <span className="ml-1 text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
              {filteredTasks.filter(t => t.status === col.status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: horizontal kanban scroll */}
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        {/* Mobile: stacked columns */}
        <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0 lg:min-w-max pb-6">
          {columns.map((col) => (
            <div
              id={`col-${col.status}`}
              key={col.status}
              className="w-full lg:w-[320px] bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl p-4 flex flex-col border border-gray-100/50 dark:border-gray-800/50"
            >
              <h3 className="font-bold text-[11px] text-gray-500 dark:text-gray-400 mb-5 flex justify-between items-center uppercase tracking-[0.1em]">
                {col.title}
                <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-1 px-2.5 rounded-full text-[10px] shadow-sm border border-gray-100 dark:border-gray-700">
                  {filteredTasks.filter((t) => t.status === col.status).length}
                </span>
              </h3>
              <div className="flex-1 space-y-4 overflow-y-auto min-h-[100px] lg:min-h-[200px] scrollbar-hide">
                {filteredTasks
                  .filter((t) => t.status === col.status)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onClick={setSelectedTaskId}
                    />
                  ))}
                {filteredTasks.filter(t => t.status === col.status).length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400">No matching issues</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed z-[60] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-2xl px-6 pt-5 pb-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white" id="modal-title">Create New Issue</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-6 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Project</label>
                    <select
                      required
                      value={newTask.project_id || ''}
                      onChange={(e) => setNewTask({ ...newTask, project_id: parseInt(e.target.value) })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white transition-all py-2.5"
                    >
                      <option value="" disabled>Select project...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Issue Type</label>
                    <select
                      required
                      value={newTask.task_type || 'Task'}
                      onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value as any })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white transition-all py-2.5"
                    >
                      <option value="Task">Task</option>
                      <option value="Bug">Bug</option>
                      <option value="Story">Story</option>
                      <option value="Epic">Epic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Summary</label>
                  <input
                    type="text" required
                    value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Short summary of the issue"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white transition-all py-2.5 px-4"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea
                    rows={4}
                    value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white transition-all py-2.5 px-4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white transition-all py-2.5"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Story Points</label>
                    <input
                      type="number" min="0"
                      value={newTask.story_points} onChange={(e) => setNewTask({ ...newTask, story_points: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white transition-all py-2.5 px-4"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-bold shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95">
                    Create Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={fetchData}
        />
      )}
    </div>
  );
};
