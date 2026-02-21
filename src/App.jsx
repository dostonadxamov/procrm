import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Mijozlar from "./pages/mijozlar";
import Status from "./pages/status";
import AddStatus from "./pages/addStatus";
import Profile from "./pages/profile";
import Projects from "./pages/loyhalar";
import Setting from "./pages/settings";
import Tasks from "./pages/task";
import LeadSource from "./pages/leadSource";
import LeadDetails from "./pages/leadDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AppSidebar from "./components/AppSidebar";
import Header from "./components/Header";
import { Toaster } from "sonner";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

export function ProtectedLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full bg-gray-700">
        <AppSidebar />

        <SidebarInset className="flex flex-col bg-[#153043]">
          <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-2 bg-[#153043] px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1 p-1 text-2xl text-white" />
            <Header />
          </header>

          <main className="flex-1 overflow-auto bg-[#0f2231]">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "status",
        element: <Status />,
      },
      {
        path: "addStatus",
        element: <AddStatus />,
      },
      {
        path: "setting",
        element: <Setting />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "leadlar",
        element: <Mijozlar />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "leadSource",
        element: <LeadSource />,
      },
      {
        path: "leadDetails",
        element: <LeadDetails />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
