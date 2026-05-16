import React, { useEffect, useState } from 'react';
import { taskApi, projectApi, Task, TaskComment, User, ProjectWithMembers } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Send, 
  Award, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  User as UserIcon, 
  Calendar,
  Bookmark,
  Bug,
  ClipboardList,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  Save
} from 'lucide-react';

interface TaskDetailModalProps {
  taskId: number;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose, onTaskUpdated }) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      const allTasks = await taskApi.getTasks();
      const currentTask = allTasks.find(t => t.id === taskId);
      
      if (currentTask) {
        setTask(currentTask);
        setEditedTask(currentTask);
        const p = await projectApi.getProject(currentTask.project_id);
        setProject(p);
        
        const c = await taskApi.getComments(taskId);
        setComments(c);
        setRewardPoints(currentTask.reward_points || 0);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to fetch task details', error);
    }
  };

  const handleChange = (updates: Partial<Task>) => {
    setEditedTask(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      // Only send changed fields
      const updates: any = {};
      Object.keys(editedTask).forEach(key => {
        if ((editedTask as any)[key] !== (task as any)[key]) {
          updates[key] = (editedTask as any)[key];
        }
      });

      if (Object.keys(updates).length > 0) {
        await taskApi.updateTask(taskId, updates);
        onTaskUpdated();
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await taskApi.createComment(taskId, newComment);
      setNewComment('');
      const c = await taskApi.getComments(taskId);
      setComments(c);
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleReviewTask = async () => {
    try {
      await taskApi.updateTask(taskId, { 
        is_reviewed: true,
        reward_points: rewardPoints
      });
      onTaskUpdated();
      fetchData();
    } catch (error) {
      console.error('Failed to review task', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug': return <Bug className="w-5 h-5 text-red-500" />;
      case 'Story': return <Bookmark className="w-5 h-5 text-green-500 fill-green-500" />;
      case 'Epic': return <Layers className="w-5 h-5 text-purple-500 fill-purple-500" />;
      default: return <ClipboardList className="w-5 h-5 text-blue-500" />;
    }
  };

  // Helper to format date for display (Local Time)
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!task || !project) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-6xl border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              {getTypeIcon(editedTask.task_type || 'Task')}
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {task.task_key || `T${task.id.toString().padStart(4, '0')}`}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row h-[80vh] max-h-[850px]">
            {/* Left Column: Details */}
            <div className="w-full md:w-2/3 p-8 overflow-y-auto border-r border-gray-200 dark:border-gray-800 scrollbar-hide">
              <input 
                type="text" 
                value={editedTask.title || ''}
                onChange={(e) => handleChange({ title: e.target.value })}
                disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                className="text-4xl font-extrabold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 mb-8 w-full disabled:opacity-80 placeholder-gray-300 tracking-tight"
                placeholder="Issue Summary"
              />

              <div className="mb-10">
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Description</label>
                <textarea 
                  value={editedTask.description || ''}
                  onChange={(e) => handleChange({ description: e.target.value })}
                  disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                  placeholder="Add a more detailed description..."
                  rows={8}
                  className="w-full bg-gray-50/50 dark:bg-gray-800/30 border-2 border-gray-100 dark:border-gray-800 focus:border-primary-500/50 rounded-2xl shadow-sm focus:ring-0 sm:text-base text-gray-900 dark:text-white p-6 transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-8">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center">
                  <RefreshCw className="w-3 h-3 mr-2" /> Activity & Comments
                </h4>
                <div className="space-y-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex space-x-4 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md">
                        {comment.user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.user?.full_name || `User ${comment.user_id}`}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleAddComment} className="flex space-x-4 mt-10">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 border-2 border-primary-500/20">
                    <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment... (Type here)"
                        rows={2}
                        className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm focus:border-primary-500 focus:ring-0 sm:text-sm text-gray-900 dark:text-white pl-5 pr-14 py-4 transition-all resize-none"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-3 bottom-3 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-30 shadow-lg shadow-primary-500/30"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full md:w-1/3 p-8 bg-gray-50/30 dark:bg-gray-800/20 overflow-y-auto border-l border-gray-100 dark:border-gray-800">
              <div className="space-y-10">
                {/* Status Section */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Status</label>
                  <select 
                    value={editedTask.status}
                    onChange={(e) => handleChange({ status: e.target.value as any })}
                    className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm focus:border-primary-500 focus:ring-0 text-sm font-bold text-gray-700 dark:text-gray-200 py-3 px-4"
                  >
                    <option value="todo">TO DO</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="done">DONE</option>
                  </select>
                </div>

                {/* Details Grid */}
                <div className="space-y-8 pb-10 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assignee</span>
                    <select 
                      value={editedTask.assigned_to_id || ''}
                      onChange={(e) => handleChange({ assigned_to_id: parseInt(e.target.value) || null as any })}
                      disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                      className="bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-0 text-right cursor-pointer hover:text-primary-500 transition-colors"
                    >
                      <option value="">Unassigned</option>
                      {project.members.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reporter</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-2">
                        <UserIcon className="w-3 h-3 text-primary-600" />
                      </div>
                      {task.created_by?.full_name || 'System'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Priority</span>
                    <select 
                      value={editedTask.priority}
                      onChange={(e) => handleChange({ priority: e.target.value as any })}
                      disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                      className="bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-0 text-right cursor-pointer hover:text-primary-500 transition-colors"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Type</span>
                    <select 
                      value={editedTask.task_type}
                      onChange={(e) => handleChange({ task_type: e.target.value as any })}
                      disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                      className="bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-0 text-right cursor-pointer hover:text-primary-500 transition-colors"
                    >
                      <option value="Task">Task</option>
                      <option value="Bug">Bug</option>
                      <option value="Story">Story</option>
                      <option value="Epic">Epic</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Story Points</span>
                    <input 
                      type="number" 
                      min="0"
                      value={editedTask.story_points || 0}
                      onChange={(e) => handleChange({ story_points: parseInt(e.target.value) || 0 })}
                      disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                      className="w-16 bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-0 text-right hover:text-primary-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between group">
                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Due Date</span>
                    <input 
                      type="date"
                      value={editedTask.due_date ? new Date(editedTask.due_date).toISOString().slice(0, 10) : ''}
                      onChange={(e) => handleChange({ due_date: e.target.value ? new Date(e.target.value).toISOString() : null as any })}
                      disabled={user?.role !== 'admin' && user?.id !== task.created_by_id}
                      className="bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-0 text-right cursor-pointer hover:text-primary-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Created</span>
                    <span className="text-gray-600 dark:text-gray-400">{formatDateTime(task.created_at)}</span>
                  </div>
                  {task.created_at !== task.created_at && ( // Logic for updated_at if added
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>Updated</span>
                      <span className="text-gray-600 dark:text-gray-400">{formatDateTime(task.created_at)}</span>
                    </div>
                  )}
                </div>

                {/* Admin Review Section */}
                {user?.role === 'admin' && (
                  <div className="bg-primary-50/50 dark:bg-primary-900/20 rounded-3xl p-8 border-2 border-primary-100 dark:border-primary-800/30 shadow-sm">
                    <h4 className="text-xs font-bold text-primary-900 dark:text-primary-100 mb-6 flex items-center uppercase tracking-widest">
                      <Award className="w-5 h-5 mr-3" /> QA Review & Rewards
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] text-primary-700 dark:text-primary-300 mb-2 uppercase font-bold tracking-widest ml-1">Award Points</label>
                        <input 
                          type="number" 
                          min="0"
                          value={rewardPoints}
                          onChange={(e) => setRewardPoints(parseInt(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-gray-800 border-2 border-primary-100 dark:border-primary-800 rounded-xl shadow-sm focus:border-primary-500 focus:ring-0 text-sm font-bold py-3"
                        />
                      </div>
                      <button 
                        onClick={handleReviewTask}
                        className="w-full py-3.5 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 text-sm font-bold shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center"
                      >
                        {task.is_reviewed ? <CheckCircle className="w-5 h-5 mr-2" /> : null}
                        {task.is_reviewed ? 'Completed Review' : 'Approve & Award'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
