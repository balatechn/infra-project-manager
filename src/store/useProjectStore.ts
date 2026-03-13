import { create } from "zustand"
import { Project } from "@/types"
import { mockProjects } from "@/lib/mock-data"

interface ProjectStore {
  projects: Project[]
  selectedProject: Project | null
  filter: {
    status: string
    type: string
    manager: string
    search: string
  }
  setProjects: (projects: Project[]) => void
  selectProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setFilter: (filter: Partial<ProjectStore["filter"]>) => void
  getFilteredProjects: () => Project[]
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: mockProjects,
  selectedProject: null,
  filter: { status: "all", type: "all", manager: "all", search: "" },

  setProjects: (projects) => set({ projects }),

  selectProject: (project) => set({ selectedProject: project }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  getFilteredProjects: () => {
    const { projects, filter } = get()
    return projects.filter((p) => {
      if (filter.status !== "all" && p.status !== filter.status) return false
      if (filter.type !== "all" && p.projectType !== filter.type) return false
      if (filter.manager !== "all" && p.projectManager !== filter.manager)
        return false
      if (
        filter.search &&
        !p.name.toLowerCase().includes(filter.search.toLowerCase()) &&
        !p.client.toLowerCase().includes(filter.search.toLowerCase())
      )
        return false
      return true
    })
  },
}))
