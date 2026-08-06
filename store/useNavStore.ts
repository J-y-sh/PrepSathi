import { create } from "zustand";

type NavTab = "dashboard" | "sprint" | "library" | "sandbox" | "analytics";

interface NavState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
