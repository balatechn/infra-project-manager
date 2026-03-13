import { create } from "zustand"
import { Task, TaskStatus } from "@/types"
import { mockTasks } from "@/lib/mock-data"

interface TaskStore {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  getTasksByProject: (projectId: string) => Task[]
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTaskTree: (projectId: string) => Task[]
}

function buildTree(tasks: Task[], parentId: string | null): Task[] {
  return tasks
    .filter((t) => t.parentId === parentId)
    .map((t) => ({
      ...t,
      children: buildTree(tasks, t.id),
    }))
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    })),

  getTasksByProject: (projectId) =>
    get().tasks.filter((t) => t.projectId === projectId),

  getTasksByStatus: (status) =>
    get().tasks.filter((t) => t.status === status),

  getTaskTree: (projectId) => {
    const projectTasks = get().tasks.filter((t) => t.projectId === projectId)
    return buildTree(projectTasks, null)
  },
}))
