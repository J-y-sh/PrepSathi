import { create } from "zustand";
import { LibraryResource } from "@/types/Library";
import { libraryService } from "@/services/firestore/libraryService";
import { serverTimestamp } from "firebase/firestore";

interface LibraryState {
  resources: LibraryResource[];
  loading: boolean;
  error: string | null;
  fetchResources: (userId: string) => Promise<void>;
  addResource: (userId: string, data: Omit<LibraryResource, "id" | "userId" | "createdAt" | "isFavorite">) => Promise<void>;
  uploadFile: (userId: string, file: File) => Promise<string>;
  toggleFavorite: (id: string, current: boolean) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  resources: [],
  loading: false,
  error: null,

  fetchResources: async (userId: string) => {
    set({ loading: true });
    try {
      const resources = await libraryService.listByUser(userId);

      console.log("User ID:", userId);
      console.log("Fetched:", resources);

      set({ resources, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addResource: async (userId, data) => {
    const id = crypto.randomUUID();
    const newResource: Omit<LibraryResource, "id"> = {
      ...data,
      userId,
      isFavorite: false,
      createdAt: serverTimestamp(),
    };
    try {
      await libraryService.create(id, newResource as any);
      get().fetchResources(userId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  uploadFile: async (userId, file) => {
    return libraryService.uploadPDF(userId, file);
  },

  toggleFavorite: async (id, current) => {
    try {
      await libraryService.toggleFavorite(id, current);
      set((state) => ({
        resources: state.resources.map((r) =>
          r.id === id ? { ...r, isFavorite: !current } : r
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteResource: async (id) => {
    try {
      await libraryService.delete(id);
      set((state) => ({
        resources: state.resources.filter((r) => r.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
