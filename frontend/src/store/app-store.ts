import { create } from "zustand";

type AppState = {
  cargandoGlobal: boolean;
  establecerCargandoGlobal: (valor: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  cargandoGlobal: false,
  establecerCargandoGlobal: (valor) => set({ cargandoGlobal: valor })
}));
