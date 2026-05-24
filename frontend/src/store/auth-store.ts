"use client";

import { create } from "zustand";
import { cerrarSesionLocal, obtenerUsuarioSesion, type SesionAuth } from "@/services/auth";

type UsuarioSesion = SesionAuth["usuario"];

type AuthState = {
  usuario?: UsuarioSesion;
  hidratado: boolean;
  establecerSesion: (sesion: SesionAuth) => void;
  hidratarSesion: () => void;
  cerrarSesion: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  usuario: undefined,
  hidratado: false,
  establecerSesion: (sesion) => set({ usuario: sesion.usuario, hidratado: true }),
  hidratarSesion: () => set({ usuario: obtenerUsuarioSesion(), hidratado: true }),
  cerrarSesion: () => {
    cerrarSesionLocal();
    set({ usuario: undefined, hidratado: true });
  }
}));
