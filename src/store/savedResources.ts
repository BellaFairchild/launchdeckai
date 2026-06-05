import { create } from "zustand";

type SavedState = {
  saved: string[];
  convexToggle: ((resourceId: string) => void) | null;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  hydrate: (ids: string[]) => void;
  setConvexToggle: (fn: ((resourceId: string) => void) | null) => void;
};

export const useSavedResourcesStore = create<SavedState>((set, get) => ({
  saved: [],
  convexToggle: null,
  isSaved: (id) => get().saved.includes(id),
  toggle: (id) => {
    const { saved, convexToggle } = get();
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    set({ saved: next });
    convexToggle?.(id);
  },
  hydrate: (ids) => set({ saved: ids }),
  setConvexToggle: (fn) => set({ convexToggle: fn }),
}));
