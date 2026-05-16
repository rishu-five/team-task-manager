import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectApi, ProjectWithMembers, User, userApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Users, UserPlus, Edit, Mail, Shield, ShieldCheck } from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [editProjectData, setEditProjectData] = useState<any>({});

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    if (!id) return;
    try {
      const data = await projectApi.getProject(parseInt(id));
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleOpenMemberModal = () => {
    fetchAllUsers();
    setIsMemberModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedUserId) return;
    try {
      await projectApi.addMember(parseInt(id), selectedUserId as number);
      setIsMemberModalOpen(false);
      setSelectedUserId('');
      fetchProject();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload = { ...editProjectData };
      if (!payload.start_date) delete payload.start_date;
      if (!payload.expected_completion_date) delete payload.expected_completion_date;
      
      await projectApi.updateProject(parseInt(id), payload);
      setIsEditModalOpen(false);
      fetchProject();
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const openEditModal = () => {
    setEditProjectData({
      name: project?.name,
      description: project?.description,
      client_name: project?.client_name || '',
      budget: project?.budget || 0,
      total_cost_approved: project?.total_cost_approved || 0,
      cost_used: project?.cost_used || 0,
      project_code: project?.project_code || '',
      status: project?.status || 'Active',
      expected_completion_date: project?.expected_completion_date ? project.expected_completion_date.split('T')[0] : '',
      rewards_enabled: project?.rewards_enabled || false
    });
    setIsEditModalOpen(true);
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
      </div>

      <div className="bg-white dark:bg-surface shadow overflow-hidden sm:rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">{project.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
          </div>
          {currentUser?.role === 'admin' && (
            <div className="flex space-x-3">
              <button
                onClick={openEditModal}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Project
              </button>
              <button
                onClick={handleOpenMemberModal}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Add Member
              </button>
            </div>
          )}
        </div>
        
        {/* Project Details Panel */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-800/30">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {project.client_name && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.client_name}</dd>
              </div>
            )}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {project.status || 'Active'}
                </span>
              </dd>
            </div>
            {project.project_code && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Code</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.project_code}</dd>
              </div>
            )}
            
            {project.expected_completion_date && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Completion</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(project.expected_completion_date).toLocaleDateString()}
                </dd>
              </div>
            )}
            
            {/* Financials (Admin Only) */}
            {currentUser?.role === 'admin' && (
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">${project.budget?.toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost Used / Approved</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    ${project.cost_used?.toLocaleString()} / ${project.total_cost_approved?.toLocaleString()}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rewards Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {project.rewards_enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Disabled</span>
                    )}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-4">
            <Users className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-500" /> Team Members
          </h4>
          
          <div className="bg-white dark:bg-surface shadow overflow-hidden sm:rounded-md border border-gray-100 dark:border-gray-800">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {project.members.map((member) => (
                <li key={member.id} className="p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                          {member.full_name ? member.full_name.charAt(0) : member.email.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.full_name || 'No Name Provided'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        member.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {member.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                        {member.role}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {isMemberModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsMemberModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-surface rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200 dark:border-gray-800">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Add Member to Project
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleAddMember} className="space-y-4 text-left">
                      <div>
                        <label htmlFor="user" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
                        <select
                          id="user"
                          required
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
                        >
                          <option value="" disabled>Select a user...</option>
                          {users
                            .filter(u => !project.members.find(m => m.id === u.id))
                            .map(user => (
                              <option key={user.id} value={user.id}>
                                {user.full_name || user.email}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:col-start-2 sm:text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMemberModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsEditModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-surface rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6 border border-gray-200 dark:border-gray-800">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Edit Project
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleEditProject} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                          <input
                            type="text"
                            value={editProjectData.name}
                            onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Code</label>
                          <input
                            type="text"
                            value={editProjectData.project_code}
                            onChange={(e) => setEditProjectData({ ...editProjectData, project_code: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                          <input
                            type="text"
                            value={editProjectData.client_name}
                            onChange={(e) => setEditProjectData({ ...editProjectData, client_name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Completion</label>
                          <input
                            type="date"
                            value={editProjectData.expected_completion_date}
                            onChange={(e) => setEditProjectData({ ...editProjectData, expected_completion_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget ($)</label>
                          <input
                            type="number"
                            value={editProjectData.budget}
                            onChange={(e) => setEditProjectData({ ...editProjectData, budget: parseInt(e.target.value) || 0 })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                          <select
                            value={editProjectData.status}
                            onChange={(e) => setEditProjectData({ ...editProjectData, status: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          >
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Planning">Planning</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost Approved ($)</label>
                          <input
                            type="number"
                            value={editProjectData.total_cost_approved}
                            onChange={(e) => setEditProjectData({ ...editProjectData, total_cost_approved: parseInt(e.target.value) || 0 })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost Used ($)</label>
                          <input
                            type="number"
                            value={editProjectData.cost_used}
                            onChange={(e) => setEditProjectData({ ...editProjectData, cost_used: parseInt(e.target.value) || 0 })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                          rows={2}
                          value={editProjectData.description}
                          onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      
                      <div className="mt-4 flex items-center">
                        <input
                          type="checkbox"
                          id="rewards_enabled"
                          checked={editProjectData.rewards_enabled}
                          onChange={(e) => setEditProjectData({ ...editProjectData, rewards_enabled: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="rewards_enabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                          Enable Task Rewards (allow admins to grant points)
                        </label>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:col-start-2 sm:text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
