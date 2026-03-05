import { useSidebar } from "@/components/ui/sidebar";
import {
  CalendarCheck2,
  FolderOpenDot,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Settings,
  Share2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function getImageUrl(imgName) {
  if (!imgName) return null;
  if (imgName.startsWith("blob:") || imgName.startsWith("http")) return imgName;
  return `${API_BASE}/image/${imgName}`;
}

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

// NavLink className orqali active holat — inline style ishlatmaymiz
function navCls(isActive, isCollapsed, extra = "") {
  return [
    "flex items-center rounded-lg no-underline transition-colors duration-150",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-2.5"
      : "flex-row justify-start gap-3 px-4 py-2.5",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-white/[0.07] hover:text-white",
    extra,
  ].join(" ");
}

function profileCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-lg no-underline transition-colors duration-150",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-2.5"
      : "flex-row justify-start gap-2.5 px-3 py-2.5",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-white/[0.07]",
  ].join(" ");
}

function settingCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-lg no-underline transition-colors duration-150",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-2.5"
      : "flex-row justify-start gap-2.5 px-3 py-2.5",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-white/[0.07]",
  ].join(" ");
}

export default function AppSidebar() {
  const { state } = useSidebar();
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

  const avatarUrl = getImageUrl(user.img);
  const avatarLetter = (user.fullName || user.email || "U")[0].toUpperCase();
  const visibleMenus = menuItems.filter((item) => item.roles.includes(role));

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-[220px]"
      } sticky top-0 flex h-screen min-h-[80vh] flex-shrink-0 flex-col justify-between bg-[#07131d] transition-[width] duration-[250ms] ease-in-out`}
    >
      {/* TOP */}
      <div>
        {/* Profile link */}
        <div className="border-b border-white/6 pt-2 pl-2">
          <NavLink
            to="/profile"
            className={({ isActive }) => profileCls(isActive, isCollapsed)}
          >
            {/* Avatar */}
            <div className="relative h-7 w-7 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-600 bg-[#1a2e40] text-xs font-semibold text-slate-300">
                  {avatarLetter}
                </div>
              )}
            </div>

            {isCollapsed ? (
              <span className="text-center text-[10px] leading-tight text-slate-400">
                {role?.slice(0, 5) || "User"}
              </span>
            ) : (
              <div className="min-w-0">
                <div className="overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap text-slate-200">
                  {user.fullName || user.role || "User"}
                </div>
                <div className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-slate-700">
                  {user.email || "—"}
                </div>
              </div>
            )}
          </NavLink>
        </div>

        {/* Menu items */}
        <nav className="py-3">
          {visibleMenus.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) =>
                navCls(isActive, isCollapsed, "mx-2 my-0.5")
              }
            >
              <item.icon
                size={isCollapsed ? 22 : 18}
                className="flex-shrink-0"
              />
              <span
                className={`leading-tight font-medium whitespace-nowrap ${
                  isCollapsed ? "text-center text-[10px]" : "text-left text-sm"
                }`}
              >
                {item.title}
              </span>
            </NavLink>
          ))}

          {/* Pro market — disabled */}
          <div
            className={`mx-2 my-0.5 flex cursor-not-allowed items-center rounded-lg text-slate-400 opacity-45 ${
              isCollapsed
                ? "flex-col justify-center gap-1 px-0 py-2.5"
                : "flex-row justify-start gap-3 px-4 py-2.5"
            }`}
          >
            <ShoppingBag
              size={isCollapsed ? 22 : 18}
              className="flex-shrink-0"
            />
            {isCollapsed ? (
              <span className="text-center text-[10px] leading-tight font-medium">
                Pro market
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">Pro market</span>
                <span className="text-[11px] text-slate-500">Beta</span>
                <Lock size={12} />
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="p-2">
        <NavLink
          to="/setting"
          className={({ isActive }) => settingCls(isActive, isCollapsed)}
        >
          <Settings size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          <span
            className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
          >
            Sozlamalar
          </span>
        </NavLink>

        <div className="my-1 h-px bg-white/[0.06]" />

        {/* Logout */}
        <NavLink
          to="/login"
          onClick={() => localStorage.clear()}
          className={`flex items-center rounded-lg text-slate-400 no-underline transition-colors duration-150 hover:bg-red-500/20 hover:text-red-400 ${
            isCollapsed
              ? "flex-col justify-center gap-1 px-0 py-2.5"
              : "flex-row justify-start gap-2.5 px-3 py-2.5"
          }`}
        >
          <LogOut size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          <span
            className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
          >
            Logout
          </span>
        </NavLink>
      </div>
    </div>
  );
}
