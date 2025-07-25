import { create } from 'zustand';
import { Category } from '../types';
import { apiService } from '../services/api';

interface CategoryState {
  categories: Category[];
  selectedCategory: string | null;
  loading: boolean;
  loadCategories: () => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  loading: false,

  loadCategories: async () => {
    set({ loading: true });
    try {
      const categories = await apiService.getCategories();
      set({ categories: categories || [], loading: false });
    } catch (error) {
      console.error('Error loading categories:', error);
      set({ categories: [], loading: false });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },
}));