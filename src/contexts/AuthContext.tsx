import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Modo de desarrollo: permitir login sin Supabase
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        // Simular usuario autenticado en desarrollo
        const mockUser = {
          id: 'dev-user',
          email: email,
          user_metadata: { full_name: 'Usuario de Desarrollo' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        
        setUser(mockUser);
        toast.success("Inicio de sesión exitoso (Modo Desarrollo)");
        navigate("/");
        return { error: null };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success("Inicio de sesión exitoso");
      navigate("/");
      return { error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Error desconocido");
      toast.error("Error al iniciar sesión");
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este correo ya está registrado. Intenta iniciar sesión.");
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      toast.success("Cuenta creada exitosamente");
      navigate("/");
      return { error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Error desconocido");
      toast.error("Error al crear la cuenta");
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Sesión cerrada");
      navigate("/auth");
    } catch (error: unknown) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
