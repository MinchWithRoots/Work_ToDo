import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Сегодня" },
  { to: "/summary", label: "Сводка" },
  { to: "/calendar", label: "Календарь" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-end gap-4 px-4 sm:px-6">
          <nav className="flex items-center gap-1 rounded-full bg-muted p-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Outlet />
      </main>
    </div>
  );
}
