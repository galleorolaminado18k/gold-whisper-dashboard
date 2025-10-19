import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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

const FALLBACK_STORAGE_KEY = "galle-fallback-auth";

function generateFallbackId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `fallback-${Date.now()}`;
  }
}

function normalizeEnvBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fallbackEnabled = normalizeEnvBoolean(
    import.meta.env.VITE_ENABLE_FALLBACK_AUTH,
  );
  const fallbackDisplayName =
    import.meta.env.VITE_FALLBACK_AUTH_NAME ?? "Usuario Invitado";
  const fallbackEmail =
    typeof import.meta.env.VITE_FALLBACK_AUTH_EMAIL === "string"
      ? import.meta.env.VITE_FALLBACK_AUTH_EMAIL.trim().toLowerCase()
      : null;
  const fallbackAllowedEmails =
    typeof import.meta.env.VITE_FALLBACK_ALLOWED_EMAILS === "string"
      ? import.meta.env.VITE_FALLBACK_ALLOWED_EMAILS.split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean)
      : null;

  const createMockUser = (email: string, fullName: string): User =>
    ({
      id: generateFallbackId(),
      email,
      user_metadata: { full_name: fullName },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    }) as User;

  const persistFallbackSession = (email: string, name: string) => {
    if (!fallbackEnabled) return;
    try {
      localStorage.setItem(
        FALLBACK_STORAGE_KEY,
        JSON.stringify({ email, name }),
      );
    } catch {
      // ignore storage errors (e.g., private mode)
    }
  };

  const clearFallbackSession = () => {
    if (!fallbackEnabled) return;
    try {
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const canUseFallbackForEmail = (email: string) => {
    if (!fallbackEnabled) return false;
    const normalized = email.trim().toLowerCase();
    if (fallbackAllowedEmails && fallbackAllowedEmails.length > 0) {
      return fallbackAllowedEmails.includes(normalized);
    }
    if (fallbackEmail) {
      return normalized === fallbackEmail;
    }
    return true;
  };

  const applyFallbackSession = (
    email: string,
    {
      name,
      showToast = true,
      redirect = true,
    }: { name?: string; showToast?: boolean; redirect?: boolean } = {},
  ): boolean => {
    if (!canUseFallbackForEmail(email)) return false;

    const displayName =
      name ||
      fallbackDisplayName ||
      (email.includes("@") ? email.split("@")[0] : email);

    const mockUser = createMockUser(email, displayName);
    setUser(mockUser);
    setSession(null);
    persistFallbackSession(email, displayName);
    setLoading(false);

    if (showToast) {
      toast.success("Inicio de sesión exitoso (modo sin conexión)");
    }
    if (redirect) {
      navigate("/");
    }

    return true;
  };

  const restoreFallbackSession = ({
    silent = false,
  }: { silent?: boolean } = {}): boolean => {
    if (!fallbackEnabled) return false;

    try {
      const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const email: string =
        typeof parsed.email === "string"
          ? parsed.email
          : import.meta.env.VITE_FALLBACK_AUTH_EMAIL ??
            "usuario@galle18k.com";
      const name: string =
        typeof parsed.name === "string" ? parsed.name : fallbackDisplayName;

      const mockUser = createMockUser(email, name);
      setUser(mockUser);
      setSession(null);
      setLoading(false);

      if (!silent) {
        toast.info("Sesión restaurada en modo sin conexión");
      }

      return true;
    } catch {
      clearFallbackSession();
      return false;
    }
  };

  const isNetworkError = (message: string) => {
    const lower = message.toLowerCase();
    return (
      lower.includes("failed to fetch") ||
      lower.includes("network") ||
      lower.includes("cors") ||
      lower.includes("ssl") ||
      lower.includes("certificate")
    );
  };

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const setup = async () => {
      try {
        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          if (nextSession?.user) {
            clearFallbackSession();
          } else if (!nextSession) {
            restoreFallbackSession({ silent: true });
          }
          setLoading(false);
        });
        subscription = sub;
      } catch {
        if (!restoreFallbackSession({ silent: true })) {
          setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          clearFallbackSession();
        } else {
          restoreFallbackSession({ silent: true });
        }
        setLoading(false);
      } catch (error) {
        if (!restoreFallbackSession({ silent: true })) {
          setLoading(false);
        }
      }
    };

    setup();

    return () => {
      subscription?.unsubscribe();
    };
  }, [fallbackEnabled]);

  const signIn = async (email: string, password: string) => {
    try {
      const isDevelopment = import.meta.env.DEV;
      const wantsFallback = canUseFallbackForEmail(email);

      if (isDevelopment) {
        const mockUser = createMockUser(email, "Usuario de Desarrollo");
        setUser(mockUser);
        setSession(null);
        setLoading(false);
        toast.success("Inicio de sesión exitoso (Modo Desarrollo)");
        navigate("/");
        return { error: null };
      }

      if (wantsFallback && !fallbackEmail) {
        applyFallbackSession(email);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          (isNetworkError(error.message) || wantsFallback) &&
          applyFallbackSession(email, {
            showToast: !wantsFallback,
            redirect: true,
          })
        ) {
          return { error: null };
        }

        toast.error(error.message);
        return { error };
      }

      clearFallbackSession();
      toast.success("Inicio de sesión exitoso");
      navigate("/");
      return { error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Error desconocido");
      if (
        (isNetworkError(err.message) || wantsFallback) &&
        applyFallbackSession(email, {
          showToast: !wantsFallback,
          redirect: true,
        })
      ) {
        return { error: null };
      }

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
        if (
          (isNetworkError(error.message) || canUseFallbackForEmail(email)) &&
          applyFallbackSession(email, { name: fullName })
        ) {
          return { error: null };
        }

        if (error.message.includes("already registered")) {
          toast.error("Este correo ya está registrado. Intenta iniciar sesión.");
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      clearFallbackSession();
      toast.success("Cuenta creada exitosamente");
      navigate("/");
      return { error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Error desconocido");
      if (
        (isNetworkError(err.message) || canUseFallbackForEmail(email)) &&
        applyFallbackSession(email, { name: fullName })
      ) {
        return { error: null };
      }

      toast.error("Error al crear la cuenta");
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (isNetworkError(error.message)) {
          clearFallbackSession();
          setUser(null);
          setSession(null);
          toast.success("Sesión cerrada (modo sin conexión)");
          navigate("/auth");
          return;
        }

        toast.error(error.message);
        return;
      }

      clearFallbackSession();
      setUser(null);
      setSession(null);
      toast.success("Sesión cerrada");
      navigate("/auth");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Error desconocido");
      if (isNetworkError(err.message)) {
        clearFallbackSession();
        setUser(null);
        setSession(null);
        toast.success("Sesión cerrada (modo sin conexión)");
        navigate("/auth");
        return;
      }

      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, signIn, signUp, signOut, loading }}
    >
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
