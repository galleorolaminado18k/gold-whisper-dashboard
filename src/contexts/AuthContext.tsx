import { useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/auth-context";

function generateFallbackId() {
  return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Crear usuario invitado inmediatamente
  const createGuestUser = useCallback((): User => {
    return {
      id: generateFallbackId(),
      email: "invitado@galle18k.com",
      user_metadata: { full_name: "Usuario Invitado" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
  }, []);

  // Inicialización súper simple - SIEMPRE funciona
  useEffect(() => {
    // Sin importar nada, crear usuario invitado INMEDIATAMENTE
    const guestUser = createGuestUser();
    setUser(guestUser);
    setSession(null);
    setLoading(false); // ¡CRÍTICO! Quitar loading inmediatamente
    
    console.log("✅ Usuario invitado activado inmediatamente");
  }, [createGuestUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    
    // Siempre crear usuario invitado, sin intentar Supabase
    const guestUser = {
      id: generateFallbackId(),
      email: email || "invitado@galle18k.com",
      user_metadata: { full_name: "Usuario Invitado" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(guestUser);
    setSession(null);
    setLoading(false);
    
    toast.success("Inicio de sesión exitoso (modo invitado)");
    navigate("/");
    return { error: null };
  }, [navigate]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    
    const guestUser = {
      id: generateFallbackId(),
      email: email || "invitado@galle18k.com",
      user_metadata: { full_name: fullName || "Usuario Invitado" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(guestUser);
    setSession(null);
    setLoading(false);
    
    toast.success("Cuenta creada exitosamente (modo invitado)");
    navigate("/");
    return { error: null };
  }, [navigate]);

  const signInAsGuest = useCallback((email?: string, name?: string) => {
    const guestUser = {
      id: generateFallbackId(),
      email: email || "invitado@galle18k.com",
      user_metadata: { full_name: name || "Usuario Invitado" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(guestUser);
    setSession(null);
    setLoading(false);
    
    toast.success("Sesión iniciada como invitado");
    navigate("/");
  }, [navigate]);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    toast.success("Sesión cerrada");
    navigate("/auth");
  }, [navigate]);

  const contextValue = useMemo(
    () => ({ user, session, signIn, signUp, signOut, signInAsGuest, loading }),
    [user, session, signIn, signUp, signOut, signInAsGuest, loading],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
