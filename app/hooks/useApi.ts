"use client";

import { useAuth } from "@/app/context/auth-context";
import { useCallback } from "react";

export const useApi = () => {
  const { logout } = useAuth();

  const apiFetch = useCallback(
    async (url: string, options: RequestInit) => {
      const response = await fetch(url, options);

      if (response.status === 401 || response.status === 403) {
        try {
          const data = await response.clone().json();
          if (
            data.description === "The JWT token has expired" ||
            data.title === "Forbidden" ||
            data.title === "Unauthorized"
          ) {
            logout();
            // Return a new response to prevent downstream code from trying to process the original error response
            return new Response(JSON.stringify({ error: "Token expired" }), {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch (error) {
          // The response might not be JSON, or another error occurred.
          // In any case of 401/403, logging out is a safe default.
          logout();
          return new Response(JSON.stringify({ error: "Authentication error" }), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      return response;
    },
    [logout],
  );

  return apiFetch;
};
