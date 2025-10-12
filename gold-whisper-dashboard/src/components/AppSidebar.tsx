import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Package,
  CreditCard,
  Users,
  Cake,
  MapPin,
  Settings,
  FolderKanban,
  ShoppingCart,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "CRM", url: "/crm-inbox", icon: FolderKanban },
  { title: "Publicidad", url: "/advertising", icon: TrendingUp },
  { title: "Ventas", url: "/sales", icon: ShoppingCart },
  { title: "Facturación", url: "/billing", icon: FileText },
  { title: "Entregas", url: "/deliveries", icon: Package },
  { title: "Pagos", url: "/payments", icon: CreditCard },
  { title: "Clientes", url: "/customers", icon: Users },
  { title: "Cumpleaños", url: "/birthdays", icon: Cake },
  { title: "Geografía", url: "/geography", icon: MapPin },
  { title: "Configuración", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* HEADER: reemplazamos la imagen por el texto con degradado dorado */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div
          className="
            w-full rounded-2xl ring-1 ring-[#d4a32c33]
            bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(0,0,0,0.08))]
            flex items-center justify-center
            overflow-hidden
            transition-all
            hover:-translate-y-0.5
            hover:shadow-[0_8px_28px_rgba(234,179,8,0.25)]
          "
          style={{ height: open ? 96 : 64 }}
        >
          {open ? (
            <span
              className="
                select-none
                text-4xl sm:text-5xl font-extrabold tracking-[0.12em]
                bg-gradient-to-b from-[#F1E58C] via-[#E6C956] to-[#B9872C]
                bg-clip-text text-transparent
                drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]
              "
              // Sugerimos una sans geométrica; si tienes Montserrat instalada se usará,
              // si no, cae en el sistema. (No toca tu configuración global.)
              style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui" }}
            >
              GALLE
            </span>
          ) : (
            <div
              className="
                h-10 w-10 rounded-xl
                bg-gradient-to-b from-[#F1E58C] via-[#E6C956] to-[#B9872C]
                text-black/80
                flex items-center justify-center
                font-extrabold text-lg
                shadow-[inset_0_0_12px_rgba(0,0,0,0.15)]
              "
              style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui" }}
              title="GALLE"
            >
              G
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-accent-foreground">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-2 rounded-xl px-3 py-3",
                          "border border-transparent transition-all duration-150",
                          "hover:-translate-y-0.5 hover:border-yellow-700/40 hover:shadow-[0_6px_18px_rgba(234,179,8,0.15)]",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50",
                        ].join(" ")
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between w-full">
          {open && (
            <div className="flex-1 mr-2">
              <p className="text-xs text-sidebar-accent-foreground">
                Sistema de Gestión
              </p>
            </div>
          )}
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
