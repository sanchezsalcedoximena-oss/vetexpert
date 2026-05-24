"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type PasswordInputProps = {
  label: string;
  name: string;
  error?: string;
  placeholder?: string;
};

export function PasswordInput({ error, label, name, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        autoComplete={name === "contrasena" ? "current-password" : "new-password"}
        error={error}
        label={label}
        name={name}
        placeholder={placeholder}
        type={visible ? "text" : "password"}
      />
      <Button
        aria-label={visible ? "Ocultar contrasena" : "Mostrar contrasena"}
        className="absolute bottom-0 right-1"
        size="icon"
        title={visible ? "Ocultar contrasena" : "Mostrar contrasena"}
        type="button"
        variant="ghost"
        onClick={() => setVisible((valor) => !valor)}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>
    </div>
  );
}
