import { create } from 'zustand';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasks: Task[];
}

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id)
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));