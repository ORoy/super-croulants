import { createContext, useContext, useState, type ReactNode } from "react";

const ADMIN_PASSWORD = "LesVieuxCroulants987";
const STORAGE_KEY = "sc-admin";

type AdminContextValue = {
  isAdmin: boolean;
  unlock: (password: string) => boolean;
  signOut: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

function readStoredAdmin(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(readStoredAdmin);

  const unlock = (password: string): boolean => {
    if (password !== ADMIN_PASSWORD) return false;
    setIsAdmin(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* storage unavailable, in-memory state still works */
    }
    return true;
  };

  const signOut = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable, in-memory state still works */
    }
  };

  return <AdminContext.Provider value={{ isAdmin, unlock, signOut }}>{children}</AdminContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
