"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/auth-context";
import {
  Menu,
  X,
  LogOut,
  FileText,
  QrCode,
  BarChart3,
  Users,
  Plus,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Asegurarnos de que los valores sean strings
  const userName = typeof user?.name === "string" ? user.name : "";
  const userAvatar = typeof user?.avatar === "string" ? user.avatar : "";

  // Verificar si el usuario es admin basado en el rol
  const isAdmin =
    user?.role?.name === "ADMIN" ||
    user?.authorities?.some((auth) => auth.authority === "ROLE_ADMIN");

  const handleNavigation = (path: string) => {
    setMenuOpen(false);
    if (pathname !== path) {
      router.push(path);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              <span>Depor</span>
              <span className="text-orange-500">Ar</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleNavigation("/metrics")}
                    className={`text-gray-700 hover:text-primary transition-colors flex items-center ${
                      pathname === "/metrics" ? "text-primary" : ""
                    }`}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Métricas
                  </button>
                  <button
                    onClick={() => handleNavigation("/users")}
                    className={`text-gray-700 hover:text-primary transition-colors flex items-center ${
                      pathname === "/users" ? "text-primary" : ""
                    }`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </button>
                </>
              )}
              <button
                onClick={() => handleNavigation("/scan")}
                className={`text-gray-700 hover:text-primary transition-colors flex items-center ${
                  pathname === "/scan" ? "text-primary" : ""
                }`}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Estados
              </button>
              <button
                onClick={() => handleNavigation("/analyze")}
                className={`text-gray-700 hover:text-primary transition-colors flex items-center ${
                  pathname === "/analyze" ? "text-primary" : ""
                }`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Analizar PDF
              </button>
              <button
                onClick={() => handleNavigation("/manual-order")}
                className={`text-gray-700 hover:text-primary transition-colors flex items-center ${
                  pathname === "/manual-order" ? "text-primary" : ""
                }`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Cargar Pedido
              </button>
            </nav>
          )}

          {/* User Menu (Desktop) */}
          {user && (
            <div className="hidden md:flex items-center">
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {getInitials(userName)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {userName}
                  </span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{userName}</p>
                    <p className="text-gray-500 capitalize">
                      {user.role?.name || ""}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <div className="py-3 border-b">
              <div className="flex items-center space-x-3 px-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {getInitials(userName)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{userName}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user.role?.name || ""}
                  </p>
                </div>
              </div>
            </div>

            <nav className="py-2 space-y-1">
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleNavigation("/metrics")}
                    className={`flex items-center w-full px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md ${
                      pathname === "/metrics" ? "bg-gray-100" : ""
                    }`}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Métricas
                  </button>
                  <button
                    onClick={() => handleNavigation("/users")}
                    className={`flex items-center w-full px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md ${
                      pathname === "/users" ? "bg-gray-100" : ""
                    }`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </button>
                </>
              )}
              <button
                onClick={() => handleNavigation("/scan")}
                className={`flex items-center w-full px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md ${
                  pathname === "/scan" ? "bg-gray-100" : ""
                }`}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Escanear QR
              </button>
              <button
                onClick={() => handleNavigation("/analyze")}
                className={`flex items-center w-full px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md ${
                  pathname === "/analyze" ? "bg-gray-100" : ""
                }`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Analizar PDF
              </button>
              <button
                onClick={() => handleNavigation("/manual-order")}
                className={`flex items-center w-full px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md ${
                  pathname === "/manual-order" ? "bg-gray-100" : ""
                }`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Cargar Pedido
              </button>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex items-center w-full px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
