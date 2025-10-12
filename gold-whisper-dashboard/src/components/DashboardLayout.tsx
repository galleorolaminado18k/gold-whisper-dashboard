import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        {/* Wrapper para aplicar el efecto hover/active a los links del sidebar */}
        <div
          className={`
            /* Estilos base para cualquier <a> dentro del sidebar */
            [&_a]:flex [&_a]:items-center [&_a]:gap-3
            [&_a]:rounded-xl [&_a]:px-3 [&_a]:py-2
            [&_a]:transition-all [&_a]:duration-200

            /* Efecto LIFT + halo dorado al pasar el mouse */
            [&_a:hover]:-translate-y-0.5 [&_a:hover]:scale-[1.02]
            [&_a:hover]:shadow-md [&_a:hover]:shadow-amber-500/10
            [&_a:hover]:ring-1 [&_a:hover]:ring-amber-500/20
            [&_a:hover]:text-amber-300

            /* Íconos: un poco de “pop” y desplazamiento */
            [&_a_svg]:transition-transform [&_a_svg]:duration-200
            [&_a:hover_svg]:scale-110 [&_a:hover_svg]:-translate-y-0.5

            /* Estado activo (soporta .active o aria-current="page") */
            [&_a.active]:bg-amber-500/10 [&_a.active]:text-amber-300
            [&_a.active]:ring-1 [&_a.active]:ring-amber-500/30
            [&_a[aria-current="page"]]:bg-amber-500/10
            [&_a[aria-current="page"]]:text-amber-300
            [&_a[aria-current="page"]]:ring-1
            [&_a[aria-current="page"]]:ring-amber-500/30
          `}
        >
          <AppSidebar />
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

