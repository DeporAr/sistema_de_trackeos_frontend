"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Role } from "@/app/types/user";
import {
  AlertCircle,
  Edit,
  Trash2,
  UserPlus,
  X,
  Save,
  Loader2,
} from "lucide-react";

// Tipo para usuarios
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  duxId?: string;
}

export default function UsersPage() {
  const { user: loggedInUser, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userName: "",
    role: "OPERADOR",
    duxId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para el diálogo de confirmación de eliminación
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Estados para mensajes
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Efecto para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efecto para verificar autenticación y cargar usuarios
  useEffect(() => {
    if (mounted && !isLoading) {
      if (!loggedInUser) {
        router.push("/login");
      } else if (loggedInUser.role?.name !== "ADMIN" && loggedInUser.role?.name !== "SUPER_ADMIN") {
        router.push("/");
      } else {
        loadUsers();
      }
    }
  }, [mounted, loggedInUser, isLoading, router]);

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        "https://incredible-charm-production.up.railway.app/users/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
      }

      const data = await response.json();
      // Transformar los datos para que coincidan con la interfaz
      const transformedData = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: { name: user.role }, // Asumimos que la API devuelve el nombre del rol como un string
        duxId: user.duxId,
      }));
      setUsers(transformedData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setErrorMessage("Error al cargar la lista de usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Función para validar el formulario
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El email no es válido";
    }

    if (!editingUser && !formData.password) {
      errors.password = "La contraseña es requerida para nuevos usuarios";
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.fullName) {
      errors.fullName = "El nombre completo es requerido";
    }

    if (!formData.userName) {
      errors.userName = "El nombre de usuario es requerido";
    }

    if (!formData.role) {
      errors.role = "El rol es requerido";
    }

    if (!formData.duxId) {
      errors.duxId = "El DUX ID es requerido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para abrir el formulario de creación
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      userName: "",
      role: "OPERADOR",
      duxId: "",
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Función para abrir el formulario de edición
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // No mostrar la contraseña actual
      fullName: user.name,
      userName: user.username,
      role: user.role.name,
      duxId: user.duxId || "",
    });
    setFormErrors({});
    setShowForm(true);
  };

  // Función para cancelar el formulario
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormErrors({});
  };

  // Función para enviar el formulario
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar mensajes
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const response = await fetch(
          `https://incredible-charm-production.up.railway.app/users/${editingUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.fullName,
              username: formData.userName,
              role: formData.role.toUpperCase(),
              duxId: formData.duxId,
              ...(formData.password && { password: formData.password }),
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al actualizar el usuario",
          );
        }

        setSuccessMessage("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        const userData = {
          email: formData.email,
          fullName: formData.fullName.trim(),
          userName: formData.userName.trim(),
          password: formData.password,
          role: formData.role.toUpperCase(),
          duxId: formData.duxId.trim(),
        };

        console.log("Enviando datos:", userData); // Para debugging

        const response = await fetch(
          "https://incredible-charm-production.up.railway.app/auth/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(userData),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al crear el usuario");
        }

        setSuccessMessage("Usuario creado correctamente");
      }

      // Recargar lista de usuarios
      await loadUsers();
      setShowForm(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al guardar el usuario",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar la eliminación de usuario
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  // Función para confirmar la eliminación
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/users/${userToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }

      setSuccessMessage("Usuario eliminado correctamente");
      await loadUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error al eliminar el usuario",
      );
    } finally {
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser || (loggedInUser.role?.name !== "ADMIN" && loggedInUser.role?.name !== "SUPER_ADMIN")) {
    return null; // La redirección se maneja en el useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-akira">GESTIÓN DE USUARIOS</h1>
          <button
            onClick={handleAddUser}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Agregar Usuario
          </button>
        </div>

        {/* Mensajes de éxito y error */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DUX ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.role.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.duxId || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {loggedInUser?.role?.name === "SUPER_ADMIN" && loggedInUser.id !== user.id && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {user.id !== loggedInUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id.toString())}
                                className="text-red-600 hover:text-red-500"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario de usuario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </h2>
                <button
                  onClick={handleCancelForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Campo de Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Campo de Contraseña */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {editingUser
                        ? "Nueva Contraseña (opcional)"
                        : "Contraseña"}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleFormChange("password", e.target.value)
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                        formErrors.password ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Campo de Nombre Completo */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre Completo
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleFormChange("fullName", e.target.value)
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                        formErrors.fullName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Campo de Nombre de Usuario */}
                  <div>
                    <label
                      htmlFor="userName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre de Usuario
                    </label>
                    <input
                      id="userName"
                      type="text"
                      value={formData.userName}
                      onChange={(e) =>
                        handleFormChange("userName", e.target.value)
                      }
                      className={`mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                        formErrors.userName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.userName && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.userName}
                      </p>
                    )}
                  </div>

                  {/* Campo de Rol */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rol
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleFormChange("role", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                      <option value="OPERADOR">Operador</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  {/* Campo de DUX ID */}
                  <div>
                    <label
                      htmlFor="duxId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      DUX ID
                    </label>
                    <input
                      id="duxId"
                      type="text"
                      value={formData.duxId}
                      onChange={(e) => handleFormChange("duxId", e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                        formErrors.duxId ? "border-red-500" : ""
                      }`}
                      placeholder="Ingrese el DUX ID"
                    />
                    {formErrors.duxId && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.duxId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Diálogo de confirmación de eliminación */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium">Confirmar Eliminación</h3>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción
                no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
