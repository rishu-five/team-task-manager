import React, { useState, useEffect } from 'react';
import { userApi, User } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Users as UsersIcon, Plus, Shield, ShieldCheck, Edit2, Power, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

export const UsersList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ email: '', full_name: '', password: '', role: 'member', is_active: 1 });
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const clearFormData = () => {
    setFormData({ email: '', full_name: '', password: '', role: 'member', is_active: 1 });
    setIsEditMode(false);
    setEditingUserId(null);
    setError('');
  };

  const handleClose = () => {
    clearFormData();
    setIsModalOpen(false);
  };

  const handleOpenCreate = () => {
    clearFormData();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      role: user.role,
      is_active: user.is_active ?? 1
    });
    setEditingUserId(user.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditMode && editingUserId) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userApi.updateUser(editingUserId, updateData);
      } else {
        await userApi.createUser(formData);
      }
      setIsModalOpen(false);
      clearFormData();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} user`);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.is_active === 1 ? 0 : 1;
      await userApi.updateUser(user.id, { is_active: newStatus });
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const getCreatorName = (createdById?: number | null) => {
    if (!createdById) return 'System';
    const creator = users.find(u => u.id === createdById);
    return creator?.full_name || creator?.email || 'Unknown';
  };

  if (currentUser?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center tracking-tight">
            <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-primary-500 flex-shrink-0" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9 sm:ml-11">Control access and roles for your team</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          <UserPlus className="-ml-1 mr-2 h-5 w-5" />
          Add New User
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-surface shadow-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Created By</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg border border-primary-200/50 dark:border-primary-800/50 flex-shrink-0">
                      {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{u.full_name || 'No Name'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                    {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${u.is_active === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                    {u.is_active === 1 ? 'Active' : 'Closed'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getCreatorName(u.created_by_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenEdit(u)} className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-1 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  {u.id !== currentUser.id && (
                    <button onClick={() => handleToggleStatus(u)} className={`${u.is_active === 1 ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'} p-1 transition-colors`}><Power className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setExpandedRow(expandedRow === u.id ? null : u.id)}
            >
              <div className="flex items-center min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg flex-shrink-0">
                  {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.full_name || 'No Name'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${u.is_active === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                  {u.is_active === 1 ? 'Active' : 'Closed'}
                </span>
                {expandedRow === u.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
            {expandedRow === u.id && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Role</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                    {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                    {u.role}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created By</span>
                  <span className="text-gray-900 dark:text-white font-medium">{getCreatorName(u.created_by_id)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleOpenEdit(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {u.id !== currentUser.id && (
                    <button onClick={() => handleToggleStatus(u)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors ${u.is_active === 1 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      <Power className="w-3.5 h-3.5" />
                      {u.is_active === 1 ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed z-[60] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-0 sm:pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div
              className="inline-block w-full align-bottom sm:align-middle bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl px-6 pt-5 pb-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden flex justify-center mb-4">
                <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {isEditMode ? 'Edit User' : 'Create New User'}
                </h3>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 p-1">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm border border-red-100 dark:border-red-900/30">{error}</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <input type="email" required disabled={isEditMode} value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 px-4 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input type="text" value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 px-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                      <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 px-2">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                      <select value={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 px-2">
                        <option value={1}>Active</option>
                        <option value={0}>Closed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      {isEditMode ? 'New Password (leave empty to keep)' : 'Password'}
                    </label>
                    <input type="password" required={!isEditMode} value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 px-4" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={handleClose} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 sm:flex-none px-8 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-bold shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95">
                    {isEditMode ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
