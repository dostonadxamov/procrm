import { useState, useEffect } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

async function apiFetch(url, token) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

export default function Status() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true); // birinchi yuklash
  const [statusLoading, setStatusLoading] = useState(false); // loyiha o'zgartirish

  const navigate = useNavigate();
  const token = localStorage.getItem("user");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const savedId = localStorage.getItem("projectId");
    const savedName = localStorage.getItem("projectName");

    const init = async () => {
      try {
        if (savedId) {
          // ── projectId bor → projects + statuses PARALLEL ──────────────
          const [projRes, statRes] = await Promise.all([
            apiFetch(`${API}/projects`, token),
            apiFetch(`${API}/status/${savedId}`, token),
          ]);
          if (!projRes || !statRes) return;

          const [projData, statData] = await Promise.all([
            projRes.json(),
            statRes.json(),
          ]);

          const list = Array.isArray(projData) ? projData : [];
          setProjects(list);
          setStatus(Array.isArray(statData) ? statData : []);

          const current = list.find((p) => String(p.id) === String(savedId));
          setSelectedProject(current ?? { id: savedId, name: savedName });
        } else {
          // ── projectId yo'q → faqat projects ──────────────────────────
          const res = await apiFetch(`${API}/projects`, token);
          if (!res) return;
          const data = await res.json();
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Init xatosi:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleProjectChange = async (name) => {
    const p = projects.find((x) => x.name === name);
    if (!p) return;

    localStorage.setItem("projectId", p.id);
    localStorage.setItem("projectName", p.name);
    setSelectedProject(p);
    setStatusLoading(true);

    try {
      const res = await apiFetch(`${API}/status/${p.id}`, token);
      if (!res) return;
      const data = await res.json();
      setStatus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Header ────────────────────────────────────────────────────────────────
  const Header = () => (
    <div className="sticky top-0 z-10 flex justify-between border-b border-[#284860] bg-[#0d1e35] p-6 text-white">
      <Select
        value={selectedProject?.name ?? ""}
        onValueChange={handleProjectChange}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Loyihani tanlang" />
        </SelectTrigger>
        <SelectContent className="mt-10">
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.name}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link
        to="/addStatus"
        className="flex items-center gap-2 rounded-xl border px-3 py-1 hover:bg-[#1b3e57]"
      >
        <Plus className="w-5" /> Add
      </Link>
    </div>
  );

  // ── Birinchi yuklash ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="flex flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-10 flex justify-between border-b border-[#284860] bg-[#0d1e35] p-6">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
        <div className="flex gap-4 p-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-80 rounded-lg" />
            ))}
        </div>
      </section>
    );
  }

  // ── Loyiha tanlanmagan ────────────────────────────────────────────────────
  if (!selectedProject) {
    return (
      <section className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <FolderOpen className="h-14 w-14 text-blue-400" />
          <p className="text-lg font-semibold text-white">Loyiha tanlanmagan</p>
          <p className="text-sm text-gray-400">
            Statuslarni ko'rish uchun loyihani tanlang
          </p>
          <div className="mt-2 flex w-64 flex-col gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProjectChange(p.name)}
                className="rounded-lg border border-[#2a4868] bg-[#11263a] px-4 py-3 text-left text-white transition-colors hover:bg-[#1a3552]"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Asosiy render ─────────────────────────────────────────────────────────
  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      <Header />

      {statusLoading ? (
        <div className="flex gap-4 p-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-80 rounded-lg" />
            ))}
        </div>
      ) : status.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-semibold text-white">
            Bu loyihada hali status yo'q
          </p>
          <p className="text-sm text-gray-400">
            Add tugmasini bosib status qo'shing
          </p>
        </div>
      ) : (
        <div className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto p-6 pt-0">
          {status.map((col) => (
            <div key={col.id} className="flex flex-col">
              <div
                className="flex w-80 shrink-0 flex-col overflow-hidden rounded-lg border-b-4 bg-[#11263a] shadow-sm"
                style={{ borderBottomColor: col.color || "#6b7280" }}
              >
                <div className="flex items-center justify-between bg-[#153043] px-4 py-3 font-semibold text-white">
                  <span className="truncate">{col.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
