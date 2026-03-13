import { create } from "zustand"
import { Issue } from "@/types"
import { mockIssues } from "@/lib/mock-data"

interface IssueStore {
  issues: Issue[]
  setIssues: (issues: Issue[]) => void
  addIssue: (issue: Issue) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  deleteIssue: (id: string) => void
  getIssuesByProject: (projectId: string) => Issue[]
}

export const useIssueStore = create<IssueStore>((set, get) => ({
  issues: mockIssues,

  setIssues: (issues) => set({ issues }),

  addIssue: (issue) =>
    set((state) => ({ issues: [issue, ...state.issues] })),

  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),

  deleteIssue: (id) =>
    set((state) => ({ issues: state.issues.filter((i) => i.id !== id) })),

  getIssuesByProject: (projectId) =>
    get().issues.filter((i) => i.projectId === projectId),
}))
