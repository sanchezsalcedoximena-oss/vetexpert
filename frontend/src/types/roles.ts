export const roles = ["admin", "veterinario", "secretaria"] as const;

export type Rol = (typeof roles)[number];
