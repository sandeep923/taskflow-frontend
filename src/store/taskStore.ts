import { create } from 'zustand';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
}

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));