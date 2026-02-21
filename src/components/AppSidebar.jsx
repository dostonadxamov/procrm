import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  CalendarCheck2,
  CheckCircle,
  LayoutDashboard,
  Lock,
  Share2,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Statuslar", url: "/status", icon: CheckCircle },
  { title: "Leadlar", url: "/leadlar", icon: Users },
  { title: "Tasklar", url: "/tasks", icon: CalendarCheck2 },
  { title: "Lead manbasi", url: "/leadSource", icon: Share2 },
];

export default function AppSidebar() {
  const { state } = useSidebar(); // "expanded" | "collapsed"
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="text-white">
      <SidebarContent className="bg-[#07131d]">
        <SidebarGroup>
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <SidebarGroupLabel
            className={`flex items-center gap-3 px-4 py-5 ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <img
              src="/ProHomeLogo.png"
              className={`shrink-0 transition-all ${isCollapsed ? "w-8" : "w-10"}`}
              alt="Pro Home"
            />
            {!isCollapsed && (
              <span className="text-lg font-bold text-white">Pro Home CRM</span>
            )}
          </SidebarGroupLabel>

          {/* ── Menu ─────────────────────────────────────────────────── */}
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
                          isCollapsed ? "justify-center px-2" : ""
                        } ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        }`
                      }
                    >
                      <item.icon
                        className={`shrink-0 transition-all ${
                          isCollapsed ? "h-7 w-7" : "h-6 w-6"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-base font-medium">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
