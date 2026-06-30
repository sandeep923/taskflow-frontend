import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../store/taskStore';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const COLUMNS = [
  { id: 'TODO', label: '📋 Todo', color: 'bg-gray-100' },
  { id: 'DOING', label: '⚡ In Progress', color: 'bg-blue-50' },
  { id: 'DONE', label: '✅ Done', color: 'bg-green-50' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-700' },
];

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
}

const getPriorityStyle = (priority: string) =>
  PRIORITIES.find((p) => p.value === priority)?.color || '';

const TaskCard = ({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing"
    >
      <div {...attributes} {...listeners}>
        <h4 className="font-medium text-gray-800 mb-2">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
        )}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityStyle(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const Column = ({
  column,
  tasks,
  onDelete,
}: {
  column: typeof COLUMNS[0];
  tasks: Task[];
  onDelete: (id: string) => void;
}) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className={`${column.color} rounded-2xl p-4 min-h-[200px]`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{column.label}</h3>
        <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 min-h-[100px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Drop tasks here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, isLoading, setTasks, addTask, updateTask, deleteTask, setLoading } = useTaskStore();

  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get('/api/projects');
      const project = res.data.find((p: any) => p.id === id);
      if (project) setProjectName(project.name);
    } catch (error) {
      console.error('Failed to fetch project');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/tasks/${id}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle) return;
    setIsCreating(true);
    try {
      const res = await api.post('/api/tasks', {
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        priority: newTaskPriority,
        projectId: id,
      });
      addTask(res.data);
      setShowModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('MEDIUM');
      setNewTaskStatus('TODO');
    } catch (error) {
      console.error('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/api/ai/generate-tasks', {
        projectName: projectName,
        description: '',
      });
      for (const taskTitle of res.data.tasks) {
        const taskRes = await api.post('/api/tasks', {
          title: taskTitle,
          status: 'TODO',
          priority: 'MEDIUM',
          projectId: id,
        });
        addTask(taskRes.data);
      }
    } catch (error) {
      console.error('Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task');
    }
  };

  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const draggedTask = tasks.find((t) => t.id === activeTaskId);
    if (!draggedTask) return;

    let targetStatus = over.id as string;
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    }

    const validStatuses = COLUMNS.map((c) => c.id);
    if (!validStatuses.includes(targetStatus)) return;

    if (draggedTask.status === targetStatus) return;

    updateTask(activeTaskId, { status: targetStatus });

    try {
      await api.patch(`/api/tasks/${activeTaskId}`, { status: targetStatus });
    } catch (error) {
      console.error('Failed to update task status');
      updateTask(activeTaskId, { status: draggedTask.status });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            ← Back
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">{projectName || 'Project'}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateTasks}
            disabled={isGenerating}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="hidden sm:block">Generating...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span className="hidden sm:block">AI Generate</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span className="hidden sm:block">Add Task</span>
          </button>
        </div>
      </nav>

      <div className="px-4 sm:px-8 py-6">
        {isLoading && <Spinner />}

        {!isLoading && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {COLUMNS.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={getTasksByStatus(column.id)}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-300 rotate-3">
                  <h4 className="font-medium text-gray-800 mb-2">{activeTask.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityStyle(activeTask.priority)}`}>
                    {activeTask.priority}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Task</h3>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">Task Title *</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">Description (optional)</label>
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Enter task description"
                rows={3}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1 text-sm">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-1 text-sm">Status</label>
              <select
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="TODO">Todo</option>
                <option value="DOING">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={isCreating || !newTaskTitle}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;