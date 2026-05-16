import api from './axios';

// Types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  total_reward_points: number;
  is_active: number;
  created_by_id: number | null;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_by_id: number;
  created_at: string;
  total_cost_approved?: number;
  cost_used?: number;
  budget?: number;
  client_name?: string;
  project_code?: string;
  start_date?: string;
  expected_completion_date?: string;
  status?: string;
  rewards_enabled?: boolean;
}

export interface ProjectWithMembers extends Project {
  members: User[];
  tasks: Task[];
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: User;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'Low' | 'Medium' | 'High';
  task_type: 'Task' | 'Bug' | 'Story' | 'Epic';
  key_index: number | null;
  task_key: string | null;
  story_points: number;
  due_date: string | null;
  created_at: string;
  project_id: number;
  assigned_to_id: number | null;
  created_by_id: number | null;
  is_reviewed?: boolean;
  reward_points?: number;
  assigned_to?: User;
  created_by?: User;
  project?: Project;
  comments?: TaskComment[];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
}

export const authApi = {
  login: async (data: URLSearchParams) => {
    const response = await api.post('/auth/login', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  signup: async (data: any) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateMe: async (data: { full_name?: string, email?: string, password?: string }): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/password-reset/request', { email });
    return response.data;
  },
  verifyPasswordReset: async (data: any) => {
    const response = await api.post('/auth/password-reset/verify', data);
    return response.data;
  }
};

export const dashboardApi = {
  getStats: async (projectId?: number): Promise<DashboardStats> => {
    const url = projectId ? `/dashboard/?project_id=${projectId}` : '/dashboard/';
    const response = await api.get(url);
    return response.data;
  }
};

export const projectApi = {
  getProjects: async (): Promise<ProjectWithMembers[]> => {
    const response = await api.get('/projects/');
    return response.data;
  },
  getProject: async (id: number): Promise<ProjectWithMembers> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (data: any): Promise<Project> => {
    const response = await api.post('/projects/', data);
    return response.data;
  },
  updateProject: async (id: number, data: any): Promise<ProjectWithMembers> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  addMember: async (projectId: number, userId: number) => {
    const response = await api.post(`/projects/${projectId}/members/${userId}`);
    return response.data;
  }
};

export const taskApi = {
  getTasks: async (projectId?: number): Promise<Task[]> => {
    const url = projectId ? `/tasks/?project_id=${projectId}` : '/tasks/';
    const response = await api.get(url);
    return response.data;
  },
  createTask: async (data: any): Promise<Task> => {
    const response = await api.post('/tasks/', data);
    return response.data;
  },
  updateTask: async (id: number, data: any): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  getComments: async (taskId: number): Promise<TaskComment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },
  createComment: async (taskId: number, content: string): Promise<TaskComment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  }
};

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },
  createUser: async (data: any): Promise<User> => {
    const response = await api.post('/users/', data);
    return response.data;
  },
  updateUser: async (id: number, data: any): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }
};

export const notificationApi = {
  getNotifications: async (limit: number = 20): Promise<Notification[]> => {
    const response = await api.get(`/notifications/?limit=${limit}`);
    return response.data;
  },
  markRead: async (id: number): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};
