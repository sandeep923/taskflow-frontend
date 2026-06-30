import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import api from '../api/axios';

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
];

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const { projects, isLoading, addProject, deleteProject, setProjects, setLoading } = useProjectStore();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch projects on load
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName) return;
    setIsCreating(true);
    try {
      const res = await api.post('/api/projects', {
        name: newProjectName,
        description: newProjectDesc,
        color: selectedColor,
      });
      addProject(res.data);
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setSelectedColor('bg-blue-500');
    } catch (error) {
      console.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      deleteProject(id);
    } catch (error) {
      console.error('Failed to delete project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
          ✅ TaskFlow
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">
            👋 Hello, {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              My Projects
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {projects.length} projects
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span className="hidden sm:block">New Project</span>
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              + Create Project
            </button>
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Color bar */}
                <div className={`${project.color} h-2 rounded-full mb-4`} />

                {/* Project name */}
                <h3 className="font-semibold text-gray-800 mb-1">
                  {project.name}
                </h3>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Task count */}
                <p className="text-sm text-gray-400">
                  {project.tasks?.length || 0} tasks
                </p>

                {/* Bottom */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-400 text-sm hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Create New Project
            </h3>

            {/* Project name */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Project Name *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Description (optional)
              </label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Enter project description"
                rows={3}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Color picker */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Color
              </label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`${color} w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;