"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Loader2, Save, X } from "lucide-react";
import type { User } from "./users-table";

interface UserFormProps {
  user?: User;
  onSubmit: (userData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userName: "",
    role: "preparador",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "", // No mostrar la contraseña actual
        fullName: user.fullName || "",
        userName: user.userName || "",
        role: user.role || "preparador",
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!user && !formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!user && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.fullName) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (!formData.userName) {
      newErrors.userName = "El nombre de usuario es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Si estamos editando y no se cambió la contraseña, no la enviamos
    if (user && !formData.password) {
      const { password, ...dataWithoutPassword } = formData;
      onSubmit({ ...dataWithoutPassword, id: user.id });
    } else {
      onSubmit(user ? { ...formData, id: user.id } : formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={`border-primary/20 focus-visible:ring-primary ${
            errors.email ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña{" "}
          {user && (
            <span className="text-sm text-gray-500">
              (Dejar en blanco para mantener la actual)
            </span>
          )}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className={`border-primary/20 focus-visible:ring-primary ${
            errors.password ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          className={`border-primary/20 focus-visible:ring-primary ${
            errors.fullName ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="userName">Nombre de Usuario</Label>
        <Input
          id="userName"
          value={formData.userName}
          onChange={(e) => handleChange("userName", e.target.value)}
          className={`border-primary/20 focus-visible:ring-primary ${
            errors.userName ? "border-red-500" : ""
          }`}
          disabled={isLoading}
        />
        {errors.userName && (
          <p className="text-sm text-red-500">{errors.userName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleChange("role", value)}
          disabled={isLoading}
        >
          <SelectTrigger
            id="role"
            className="border-primary/20 focus:ring-primary"
          >
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="recibidor">Recibidor</SelectItem>
            <SelectItem value="preparador">Preparador</SelectItem>
            <SelectItem value="embalador">Embalador</SelectItem>
            <SelectItem value="despachador">Despachador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-primary/20 hover:bg-primary/10"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {user ? "Actualizar Usuario" : "Crear Usuario"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
