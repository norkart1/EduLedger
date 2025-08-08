import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  admin: { id: string; username: string } | null;
  currentStudent: string | null;
  login: (admin: { id: string; username: string }) => void;
  logout: () => void;
  setCurrentStudent: (studentId: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,
      currentStudent: null,
      login: (admin) => set({ isAuthenticated: true, admin }),
      logout: () => set({ isAuthenticated: false, admin: null }),
      setCurrentStudent: (studentId) => set({ currentStudent: studentId }),
    }),
    {
      name: 'banking-auth',
    }
  )
);
