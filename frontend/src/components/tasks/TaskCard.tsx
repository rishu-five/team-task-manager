import React from 'react';
import { Task } from '../../api/services';
import { 
  Clock, 
  User as UserIcon, 
  Calendar, 
  RefreshCw,
  Bookmark,
  Bug,
  ClipboardList,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronsUp
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: number, newStatus: Task['status']) => void;
  onClick: (taskId: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onClick }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <ChevronsUp className="w-4 h-4 text-red-500" />;
      case 'Medium': return <ChevronUp className="w-4 h-4 text-orange-500" />;
      case 'Low': return <ChevronDown className="w-4 h-4 text-blue-500" />;
      default: return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug': return <Bug className="w-4 h-4 text-red-500" />;
      case 'Story': return <Bookmark className="w-4 h-4 text-green-500 fill-green-500" />;
      case 'Epic': return <Layers className="w-4 h-4 text-purple-500 fill-purple-500" />;
      default: return <ClipboardList className="w-4 h-4 text-blue-500" />;
    }
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  };

  return (
    <div 
      onClick={() => onClick(task.id)}
      className="bg-white dark:bg-surface rounded-lg shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 dark:border-gray-800 cursor-pointer group mb-3 last:mb-0"
    >
      {/* Task Key and Type */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getTypeIcon(task.task_type)}
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase group-hover:text-primary-500 transition-colors">
            {task.task_key || `TTM-${task.id}`}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {task.status === 'done' && (
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">DONE</span>
          )}
          {getPriorityIcon(task.priority)}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center -space-x-1">
          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-2 border-white dark:border-gray-800">
            <UserIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="ml-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {task.created_by?.full_name?.split(' ')[0] || 'System'}
          </span>
          {task.story_points > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {task.story_points}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {task.due_date && (
            <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
          <select 
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, e.target.value as any);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`text-[10px] font-bold px-2 py-1 rounded-md border-none focus:ring-0 cursor-pointer ${statusColors[task.status]}`}
          >
            <option value="todo">TO DO</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="done">DONE</option>
          </select>
        </div>
      </div>
    </div>
  );
};
