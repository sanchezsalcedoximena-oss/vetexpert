export const roles = ["admin", "veterinario", "secretaria", "cliente"] as const;

export type Rol = (typeof roles)[number];
