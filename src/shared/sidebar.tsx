import { NavLink } from 'react-router-dom'

const linkBase: React.CSSProperties = {
  display: 'block',
  padding: '12px 16px',
  color: '#d5c68c',
  textDecoration: 'none',
  borderRadius: 8,
  margin: '6px 10px',
  fontWeight: 600
}

export default function Sidebar() {
  return (
    <div className="p-4 bg-sidebar text-sidebar-foreground">
      <div className="text-[28px] font-extrabold tracking-wide mb-5 text-sidebar-primary">GALLE</div>
      <nav className="flex flex-col gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `block px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/crm"
          className={({ isActive }) =>
            `block px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`
          }
        >
          CRM
        </NavLink>
        {/* agrega más opciones del menú aquí */}
      </nav>
    </div>
  )
}
