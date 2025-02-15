import { create } from "zustand";
import { getUsers } from "../services/userService";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  total: number;
  fetchUsers: (search: string, page: number) => Promise<void>;
  history: User[][];
  future: User[][];
  setUsers: (newUsers: User[]) => void;
  undo: () => void;
  redo: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  total: 0,
  fetchUsers: async (search, page) => {
    const { users, total } = await getUsers(search, page);
    set({ users, total });
  },
  history: [],
  future: [],
  setUsers: (newUsers) => {
    set((state) => ({
      history: [...state.history, state.users],
      users: newUsers,
      future: [],
    }));
  },
  undo: () => {
    set((state) => {
      if (state.history.length === 0) return state;
      const lastState = state.history[state.history.length - 1];
      return {
        history: state.history.slice(0, -1),
        future: [state.users, ...state.future],
        users: lastState,
      };
    });
  },
  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const nextState = state.future[0];
      return {
        history: [...state.history, state.users],
        future: state.future.slice(1),
        users: nextState,
      };
    });
  },
}));