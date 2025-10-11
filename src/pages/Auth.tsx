import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Forzar autocomplete="new-password" en el formulario de registro
  useEffect(() => {
    const form = document.querySelector('form[data-form="signup"]') as HTMLFormElement | null;
    if (form) {
      const pwInputs = form.querySelectorAll('input[type="password"]');
      pwInputs.forEach((el) => el.setAttribute('autocomplete', 'new-password'));
      form.setAttribute('autocomplete', 'new-password');
    }
  }, []);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    await signIn(data.email, data.password);
    setLoading(false);
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    await signUp(data.email, data.password, data.fullName);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Imagen con overlay y textos */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=1600&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)',
        }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />
        
        {/* Contenido sobre la imagen */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Texto superior */}
          <div>
            <h1 className="text-6xl font-bold italic mb-2">
              ¡Bienvenid
              <span 
                className="font-bold italic"
                style={{ 
                  color: '#d4af37',
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 40px rgba(242, 208, 107, 0.6)',
                }}
              >
                @
              </span>
            </h1>
            <h2 className="text-5xl font-bold italic">a tu segunda casa!</h2>
          </div>

          {/* Logo GALLE grande en texto dorado */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 
                className="font-black text-9xl tracking-wider"
                style={{ 
                  background: 'linear-gradient(135deg, #d4af37 0%, #f2d06b 30%, #ffed4e 50%, #f2d06b 70%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6)) drop-shadow(0 0 40px rgba(212, 175, 55, 0.4))',
                  letterSpacing: '0.1em',
                }}
              >
                GALLE
              </h2>
            </div>
          </div>

          {/* Texto inferior */}
          <div className="text-center">
            <p className="text-2xl font-bold flex items-center justify-center gap-2">
              <span 
                style={{ 
                  color: '#d4af37',
                  textShadow: '0 0 15px rgba(212, 175, 55, 0.8), 0 0 30px rgba(242, 208, 107, 0.5)',
                }}
              >
                presentes en
              </span>
              <span className="inline-flex items-center gap-2">
                <svg className="w-7 h-7" viewBox="0 0 900 600">
                  <rect width="900" height="200" fill="#FCD116" y="0"/>
                  <rect width="900" height="200" fill="#003893" y="200"/>
                  <rect width="900" height="200" fill="#CE1126" y="400"/>
                </svg>
                <span 
                  className="font-bold"
                  style={{ 
                    color: '#d4af37',
                    textShadow: '0 0 15px rgba(212, 175, 55, 0.8), 0 0 30px rgba(242, 208, 107, 0.5)',
                  }}
                >
                  Colombia
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md">
          <Card className="bg-gray-800 border-none shadow-2xl p-8 rounded-3xl">
            {/* Logo GALLE en el formulario */}
            <div className="flex justify-center mb-8">
              <h2 
                className="font-black text-4xl tracking-wider"
                style={{ 
                  background: 'linear-gradient(135deg, #d4af37 0%, #f2d06b 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))',
                }}
              >
                GALLE
              </h2>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700 mb-6">
                <TabsTrigger 
                  value="signin"
                  className="data-[state=active]:bg-gray-600 text-gray-300 data-[state=active]:text-white"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-gray-600 text-gray-300 data-[state=active]:text-white"
                >
                  Completa tu Registro
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email" autoComplete="email"
                              placeholder="Email"
                              {...field}
                              disabled={loading}
                              className="bg-white border-none h-12 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="password" autoComplete="current-password"
                              placeholder="Contraseña"
                              {...field}
                              disabled={loading}
                              className="bg-white border-none h-12 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-white font-semibold text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #d4af37 0%, #f2d06b 50%, #d4af37 100%)',
                      }}
                      disabled={loading}
                    >
                      {loading ? "Ingresando..." : "Iniciar Sesión"}
                    </Button>

                    <div className="text-center mt-4">
                      <a href="#" className="text-gray-400 text-sm italic hover:text-white">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signUpForm}>
                  <form data-form="signup" onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Nombre Completo"
                              {...field}
                              disabled={loading}
                              className="bg-white border-none h-12 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email" autoComplete="email"
                              placeholder="Email"
                              {...field}
                              disabled={loading}
                              className="bg-white border-none h-12 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="password" autoComplete="current-password"
                              placeholder="Contraseña"
                              {...field}
                              disabled={loading}
                              className="bg-white border-none h-12 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="password" autoComplete="current-password"
                              placeholder="Confirmar Contraseña"
                              {...field}
                              disabled={loading}
                              className="bg-white border-none h-12 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-white font-semibold text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #d4af37 0%, #f2d06b 50%, #d4af37 100%)',
                      }}
                      disabled={loading}
                    >
                      {loading ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;


