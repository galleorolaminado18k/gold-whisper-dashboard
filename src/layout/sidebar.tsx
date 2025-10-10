// src/sidebar.tsx
import { NavLink } from "react-router-dom";
import React from "react";

const linkBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 16px",
  color: "#d5c68c",
  textDecoration: "none",
  borderRadius: 8,
  margin: "6px 10px",
  fontWeight: 600,
};

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: "#0f0f0f",
        color: "#d5c68c",
        position: "sticky",
        top: 0,
        height: "100vh",
        borderRight: "1px solid rgba(213,198,140,0.08)",
      }}
    >
      {/* Logo / header */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 2,
            marginBottom: 20,
            background: "linear-gradient(135deg, #A8861A, #F5D26A)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            padding: "14px 12px",
            borderRadius: 12,
            border: "1px solid rgba(213,198,140,0.2)",
          }}
        >
          GALLE
        </div>

        <div
          style={{
            fontSize: 14,
            opacity: 0.8,
            margin: "10px 12px 8px",
          }}
        >
          Navegación
        </div>

        {/* Menú */}
        <nav>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/crm"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            CRM
          </NavLink>

          <NavLink
            to="/conversations"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Conversaciones
          </NavLink>

          <NavLink
            to="/advertising"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Publicidad
          </NavLink>

          <NavLink
            to="/deliveries"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Entregas
          </NavLink>

          <NavLink
            to="/payments"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Pagos
          </NavLink>

          <NavLink
            to="/customers"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Clientes
          </NavLink>

          <NavLink
            to="/birthdays"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Cumpleaños
          </NavLink>

          <NavLink
            to="/geography"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Geografía
          </NavLink>

          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "rgba(213,198,140,0.10)" : "transparent",
            })}
          >
            Configuración
          </NavLink>
        </nav>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#d5c68c",
            opacity: 0.9,
            fontSize: 13,
          }}
        >
          <span>Sistema de Gestión</span>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "rgba(213,198,140,0.12)",
              border: "1px solid rgba(213,198,140,0.25)",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              color: "#1a1a1a",
              boxShadow: "0 0 0 2px rgba(0,0,0,0.15) inset",
            }}
          >
            SS
          </div>
        </div>
      </div>
    </aside>
  );
}
