import { createContext } from "react";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInAsGuest: (email?: string, name?: string) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
