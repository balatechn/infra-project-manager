import { create } from "zustand"

interface UIStore {
  sidebarCollapsed: boolean
  globalSearch: string
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setGlobalSearch: (search: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  globalSearch: "",
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setGlobalSearch: (search) => set({ globalSearch: search }),
}))
