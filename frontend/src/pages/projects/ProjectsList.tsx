import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi, Project } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Plus, Folder } from 'lucide-react';

export const ProjectsList: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: '', description: '', budget: 0, total_cost_approved: 0, project_code: '', client_name: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
    const intervalId = setInterval(() => fetchProjects(false), 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectApi.createProject(newProject);
      setIsModalOpen(false);
      setNewProject({ 
        name: '', description: '', budget: 0, total_cost_approved: 0, project_code: '', client_name: '' 
      });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Projects</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="col-span-1 bg-white dark:bg-surface rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800"
          >
            <div className="w-full flex items-center justify-between p-6 space-x-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-gray-900 dark:text-white text-lg font-medium truncate">{project.name}</h3>
                  {project.project_code && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {project.project_code}
                    </span>
                  )}
                </div>
                {project.client_name && <p className="text-sm text-primary-600 dark:text-primary-400 font-medium truncate">{project.client_name}</p>}
                <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm truncate">{project.description}</p>
                {user?.role === 'admin' && (
                  <div className="mt-2 flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div>Budget: <span className="font-semibold text-gray-900 dark:text-gray-200">${project.budget}</span></div>
                    <div>Cost: <span className="font-semibold text-gray-900 dark:text-gray-200">${project.cost_used}</span> / ${project.total_cost_approved}</div>
                  </div>
                )}
              </div>
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Folder className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Folder className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm">Create your first project to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-surface rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200 dark:border-gray-800">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Create New Project
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleCreateProject} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="project_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Code (ID)</label>
                          <input
                            type="text"
                            id="project_code"
                            value={newProject.project_code}
                            onChange={(e) => setNewProject({ ...newProject, project_code: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                        <input
                          type="text"
                          id="client_name"
                          value={newProject.client_name}
                          onChange={(e) => setNewProject({ ...newProject, client_name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget ($)</label>
                          <input
                            type="number"
                            id="budget"
                            value={newProject.budget}
                            onChange={(e) => setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="total_cost_approved" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost Approved ($)</label>
                          <input
                            type="number"
                            id="total_cost_approved"
                            value={newProject.total_cost_approved}
                            onChange={(e) => setNewProject({ ...newProject, total_cost_approved: parseInt(e.target.value) || 0 })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                          id="description"
                          rows={2}
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:col-start-2 sm:text-sm"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
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
