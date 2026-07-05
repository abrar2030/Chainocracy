import {
  BarChart3,
  Bell,
  Blocks,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users2,
  UserCog,
  UserSquare2,
  Vote,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/candidates", label: "Candidates", icon: UserSquare2 },
  { to: "/voters", label: "Voters", icon: Users2 },
  { to: "/blockchain", label: "Blockchain", icon: Blocks },
  { to: "/election-results", label: "Results", icon: BarChart3 },
  { to: "/announce-election", label: "Announce election", icon: Vote },
  { to: "/public-announcement", label: "Announcements", icon: Megaphone },
  { to: "/user", label: "Users", icon: UserCog },
  { to: "/population-data", label: "Population", icon: Bell },
];

export default function AppShell() {
  const { authState, onLogOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await onLogOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-qb-paper text-qb-ink">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-qb-line bg-white">
        <div className="px-6 py-5">
          <NavLink to="/dashboard">
            <Logo />
          </NavLink>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-qb-primary/10 text-qb-primary"
                    : "text-qb-muted hover:bg-qb-paper hover:text-qb-ink"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-qb-line p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-qb-muted transition-colors hover:bg-qb-paper hover:text-qb-danger"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="pl-64">
        <header className="flex items-center justify-between border-b border-qb-line bg-white px-8 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-qb-muted">
              Election control center
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-qb-ink">
                {authState?.name || authState?.username || "Committee"}
              </p>
              <p className="font-mono text-xs text-qb-muted">
                {authState?.role || "member"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-qb-primary/10 font-display text-sm font-bold text-qb-primary">
              {(authState?.name || authState?.username || "Q")
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
