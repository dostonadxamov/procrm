import { SidebarRail, useSidebar } from "@/components/ui/sidebar";
import {
  CalendarCheck2,
  FolderOpenDot,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Share2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ROP", "SUPERADMIN"],
  },
  {
    title: "Leadlar",
    url: "/leadlar",
    icon: Users,
    roles: ["ROP", "SALESMANAGER", "SUPERADMIN"],
  },
  {
    title: "Tasklar",
    url: "/tasks",
    icon: CalendarCheck2,
    roles: ["SALESMANAGER", "ROP", "SUPERADMIN"],
  },
  {
    title: "Sms/Rassilka",
    url: "/rassilka",
    icon: MessageSquare,
    roles: ["ROP", "SUPERADMIN"],
  },
  {
    title: "Lead manbasi",
    url: "/leadSource",
    icon: Share2,
    roles: ["ROP", "SALESMANAGER", "SUPERADMIN"],
  },
  {
    title: "Projectlar",
    url: "/projects",
    icon: FolderOpenDot,
    roles: ["ROP", "SUPERADMIN"],
  },
];

export default function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  let user = {};
  let role = "SALESMANAGER";
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      const parsed = JSON.parse(raw);
      user = parsed.user || {};
      role = user.role || "SALESMANAGER";
    }
  } catch {}

  const visibleMenus = menuItems.filter((item) => item.roles.includes(role));

  return (
    <div
      style={{
        width: isCollapsed ? "80px" : "220px",
        minHeight: "100vh",
        background: "#07131d",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.25s ease",
        flexShrink: 0,
      }}
    >
      {/* TOP */}
      <div>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "10px",
            padding: isCollapsed ? "20px 0" : "20px 16px",
            borderBottom: "1px solid #ffffff10",
            cursor: "pointer",
          }}
          onClick={toggleSidebar}
        >
          <img
            src="/ProHomeLogo.png"
            style={{ width: isCollapsed ? "32px" : "36px", flexShrink: 0 }}
            alt="Pro Home"
          />
          {!isCollapsed && (
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                whiteSpace: "nowrap",
              }}
            >
              Pro Home CRM
            </span>
          )}
        </div>

        {/* Menu items */}
        <nav style={{ padding: "12px 0" }}>
          {visibleMenus.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              style={({ isActive }) => ({
                display: "flex",
                flexDirection: isCollapsed ? "column" : "row",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: isCollapsed ? "4px" : "12px",
                padding: isCollapsed ? "10px 0" : "10px 16px",
                margin: "2px 8px",
                borderRadius: "8px",
                textDecoration: "none",
                background: isActive ? "#2563eb" : "transparent",
                color: isActive ? "#fff" : "#94a3b8",
                transition: "background 0.15s, color 0.15s",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                const isActive =
                  e.currentTarget.getAttribute("aria-current") === "page";
                e.currentTarget.style.background = isActive
                  ? "#2563eb"
                  : "transparent";
                e.currentTarget.style.color = isActive ? "#fff" : "#94a3b8";
              }}
            >
              <item.icon
                size={isCollapsed ? 22 : 18}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: isCollapsed ? "10px" : "14px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  textAlign: isCollapsed ? "center" : "left",
                  lineHeight: 1.2,
                }}
              >
                {item.title}
              </span>
            </NavLink>
          ))}

          {/* Pro market — disabled */}
          <div
            style={{
              display: "flex",
              flexDirection: isCollapsed ? "column" : "row",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? "4px" : "12px",
              padding: isCollapsed ? "10px 0" : "10px 16px",
              margin: "2px 8px",
              borderRadius: "8px",
              opacity: 0.45,
              cursor: "not-allowed",
              color: "#94a3b8",
            }}
          >
            <ShoppingBag
              size={isCollapsed ? 22 : 18}
              style={{ flexShrink: 0 }}
            />
            {isCollapsed ? (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                Pro market
              </span>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  Pro market
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Beta</span>
                <Lock size={12} />
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* BOTTOM */}
      <div style={{ padding: "8px", borderTop: "1px solid #ffffff10" }}>
        {/* Profile */}
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: isCollapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: isCollapsed ? "4px" : "10px",
            padding: isCollapsed ? "10px 0" : "10px 12px",
            borderRadius: "8px",
            textDecoration: "none",
            background: isActive ? "#2563eb" : "transparent",
            color: isActive ? "#fff" : "#94a3b8",
            marginBottom: "4px",
            transition: "background 0.15s",
          })}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          }}
          onMouseLeave={(e) => {
            const isActive =
              e.currentTarget.getAttribute("aria-current") === "page";
            e.currentTarget.style.background = isActive
              ? "#2563eb"
              : "transparent";
          }}
        >
          <div
            style={{
              width: isCollapsed ? "28px" : "28px",
              height: isCollapsed ? "28px" : "28px",
              borderRadius: "50%",
              border: "1px solid #475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              color: "#94a3b8",
              flexShrink: 0,
            }}
          >
            {user.role?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {isCollapsed ? (
            <span
              style={{
                fontSize: "10px",
                textAlign: "center",
                lineHeight: 1.2,
                color: "#94a3b8",
              }}
            >
              {user.role?.slice(0, 5) || "User"}
            </span>
          ) : (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#e2e8f0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.role || "User"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email || "—"}
              </div>
            </div>
          )}
        </NavLink>

        {/* Logout */}
        <NavLink
          to="/login"
          onClick={() => localStorage.clear()}
          style={{
            display: "flex",
            flexDirection: isCollapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: isCollapsed ? "4px" : "10px",
            padding: isCollapsed ? "10px 0" : "10px 12px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#94a3b8",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,38,38,0.2)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <LogOut size={isCollapsed ? 22 : 18} style={{ flexShrink: 0 }} />
          <span
            style={{ fontSize: isCollapsed ? "10px" : "14px", fontWeight: 500 }}
          >
            Logout
          </span>
        </NavLink>
      </div>
    </div>
  );
}
