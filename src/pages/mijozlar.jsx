import { useState, useEffect, useRef } from "react";
import {
  Plus,
  FolderOpen,
  AlertCircle,
  Loader2,
  CalendarCheck2,
  Settings,
  Search,
  X,
  Upload,
  Download,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useExcelWorker } from "../hooks/Useexcelworker";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const maxBirthDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm text-white shadow-xl ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {message}
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

function applyDrag(statuses, source, destination, draggableId) {
  const srcId = Number(source.droppableId);
  const dstId = Number(destination.droppableId);
  const dragged = statuses
    .flatMap((s) => s.leads)
    .find((l) => String(l.id) === draggableId);
  if (!dragged) return statuses;
  if (srcId === dstId && source.index === destination.index) return statuses;
  return statuses.map((status) => {
    if (srcId === dstId && status.id === srcId) {
      const items = status.leads.filter((l) => String(l.id) !== draggableId);
      items.splice(destination.index, 0, { ...dragged, statusId: dstId });
      return { ...status, leads: items };
    }
    if (status.id === srcId)
      return {
        ...status,
        leads: status.leads.filter((l) => String(l.id) !== draggableId),
      };
    if (status.id === dstId) {
      const items = [...status.leads];
      items.splice(destination.index, 0, { ...dragged, statusId: dstId });
      return { ...status, leads: items };
    }
    return status;
  });
}

const EMPTY_FORM = {
  leadSourceId: "",
  budjet: "",
  firstName: "",
  lastName: "",
  phone: "",
  extraPhone: "",
  adress: "",
  tags: [""],
  birthDate: "",
};

// ── Filter state default ─────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  budjetMin: "",
  budjetMax: "",
  sourceIds: [], // leadSource id lari
  dateFrom: "",
  dateTo: "",
};

// ── FilterPanel component ────────────────────────────────────────────────────
function FilterPanel({
  open,
  onClose,
  filters,
  onChange,
  leadSources,
  activeCount,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  if (!open) return null;

  const toggleSource = (id) => {
    onChange((f) => ({
      ...f,
      sourceIds: f.sourceIds.includes(id)
        ? f.sourceIds.filter((s) => s !== id)
        : [...f.sourceIds, id],
    }));
  };

  const clear = () => onChange(() => ({ ...DEFAULT_FILTERS }));

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 z-50 mt-2 w-72 rounded-xl border border-[#1e3a52] bg-[#0a1929] shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e3a52] px-4 py-3">
        <span className="text-xs font-semibold text-white">Filterlar</span>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="text-[11px] text-red-400 hover:text-red-300"
          >
            Tozalash
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* Budjet oralig'i */}
        <div>
          <p className="mb-2 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
            Budjet (so'm)
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.budjetMin}
              onChange={(e) =>
                onChange((f) => ({ ...f, budjetMin: e.target.value }))
              }
              className="w-full rounded-lg border border-[#1e3a52] bg-[#0f2231] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            />
            <span className="text-gray-600">—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.budjetMax}
              onChange={(e) =>
                onChange((f) => ({ ...f, budjetMax: e.target.value }))
              }
              className="w-full rounded-lg border border-[#1e3a52] bg-[#0f2231] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Manba */}
        {leadSources.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
              Manba
            </p>
            <div className="flex flex-wrap gap-1.5">
              {leadSources.map((src) => {
                const active = filters.sourceIds.includes(src.id);
                return (
                  <button
                    key={src.id}
                    onClick={() => toggleSource(src.id)}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-all"
                    style={{
                      background: active
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(255,255,255,0.04)",
                      color: active ? "#60a5fa" : "#6b7280",
                      border: `1px solid ${active ? "rgba(59,130,246,0.35)" : "transparent"}`,
                    }}
                  >
                    {src.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sana oralig'i */}
        <div>
          <p className="mb-2 text-[11px] font-medium tracking-wider text-gray-500 uppercase">
            Yaratilgan sana
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                onChange((f) => ({ ...f, dateFrom: e.target.value }))
              }
              className="w-full rounded-lg border border-[#1e3a52] bg-[#0f2231] px-2.5 py-1.5 text-[11px] text-gray-300 outline-none focus:border-blue-500/50"
              style={{ colorScheme: "dark" }}
            />
            <span className="text-gray-600">—</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                onChange((f) => ({ ...f, dateTo: e.target.value }))
              }
              className="w-full rounded-lg border border-[#1e3a52] bg-[#0f2231] px-2.5 py-1.5 text-[11px] text-gray-300 outline-none focus:border-blue-500/50"
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Icon button — iconOnly: faqat icon, aks holda icon+text ──────────────────
function IconBtn({
  icon: Icon,
  label,
  onClick,
  className = "",
  disabled = false,
  variant = "default",
  iconOnly = false,
  spin = false,
}) {
  const colors = {
    default:
      "border-[#2a4868] text-gray-300 hover:bg-[#1b3e57] hover:text-white",
    success:
      "border-green-700/50 text-green-400 hover:bg-green-900/30 hover:text-green-300",
    warning:
      "border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors duration-150 disabled:opacity-40 ${colors[variant]} ${className}`}
      style={{ height: "36px" }}
    >
      <Icon size={14} className={`shrink-0 ${spin ? "animate-spin" : ""}`} />
      {!iconOnly && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const boardRef = useRef(null);
  const isDragging = useRef(false);
  const scrollRAF = useRef(null);
  const searchInputRef = useRef(null);

  const [appState, setAppState] = useState("loading");
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  const activeFilterCount = [
    filters.budjetMin,
    filters.budjetMax,
    filters.sourceIds.length > 0 ? "x" : "",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const showToast = (message, type = "error") => setToast({ message, type });

  const toggleSearch = () => {
    setSearchOpen((o) => {
      if (!o) setTimeout(() => searchInputRef.current?.focus(), 50);
      else setSearchQuery("");
      return !o;
    });
  };

  const { importCSV, exportCSV, loading: workerLoading } = useExcelWorker();

  const handleImport = async () => {
    try {
      const leads = await importCSV();
      if (!leads.length) {
        showToast("Fayl bo\'sh yoki noto\'g\'ri format", "error");
        return;
      }
      // Birinchi statusga qo'shamiz (optimistic)
      setStatuses((prev) =>
        prev.map((s, i) =>
          i === 0
            ? {
                ...s,
                leads: [
                  ...leads.map((l) => ({
                    ...l,
                    id: Date.now() + Math.random(),
                  })),
                  ...s.leads,
                ],
              }
            : s,
        ),
      );
      showToast(`${leads.length} ta mijoz import qilindi ✅`, "success");
    } catch (err) {
      if (err.message !== "Fayl tanlanmadi")
        showToast("Import xatosi: " + err.message, "error");
    }
  };

  const handleExport = async () => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await exportCSV(statuses, `leads_${date}.csv`);
      showToast("Export muvaffaqiyatli ✅", "success");
    } catch (err) {
      showToast("Export xatosi: " + err.message, "error");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (!token) {
      navigate("/login");
      return;
    }
    const savedId = localStorage.getItem("projectId");
    const savedName = localStorage.getItem("projectName");
    const init = async () => {
      try {
        if (savedId) {
          const [projectsRes, statusesRes, sourcesRes] = await Promise.all([
            apiFetch(`${API}/projects`),
            apiFetch(`${API}/status/${savedId}`),
            apiFetch(`${API}/lead-source/${savedId}`),
          ]);
          if (!projectsRes || !statusesRes) return;
          const [projectsData, statusesData, sourcesData] = await Promise.all([
            projectsRes.json(),
            statusesRes.json(),
            sourcesRes?.json().catch(() => []),
          ]);
          setProjects(Array.isArray(projectsData) ? projectsData : []);
          setStatuses(
            statusesData.map((s) => ({
              ...s,
              id: Number(s.id),
              leads: Array.isArray(s.leads) ? s.leads : [],
            })),
          );
          setLeadSource(Array.isArray(sourcesData) ? sourcesData : []);
          setCurrentProject({ id: savedId, name: savedName });
          setAppState("ready");
        } else {
          const res = await apiFetch(`${API}/projects`);
          if (!res) return;
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setProjects(list);
          if (list.length === 1) await loadProject(list[0]);
          else setAppState("no-project");
        }
      } catch (err) {
        console.error("Init xatosi:", err);
        showToast("Ma\'lumotlar yuklanmadi", "error");
        setAppState("no-project");
      }
    };
    init();
  }, []);

  const loadProject = async (project) => {
    setAppState("loading");
    localStorage.setItem("projectId", project.id);
    localStorage.setItem("projectName", project.name);
    setCurrentProject({ id: project.id, name: project.name });
    try {
      const [statusesRes, sourcesRes] = await Promise.all([
        apiFetch(`${API}/status/${project.id}`),
        apiFetch(`${API}/lead-source/${project.id}`),
      ]);
      if (!statusesRes) return;
      const [statusesData, sourcesData] = await Promise.all([
        statusesRes.json(),
        sourcesRes?.json().catch(() => []),
      ]);
      setStatuses(
        statusesData.map((s) => ({
          ...s,
          id: Number(s.id),
          leads: Array.isArray(s.leads) ? s.leads : [],
        })),
      );
      setLeadSource(Array.isArray(sourcesData) ? sourcesData : []);
      setAppState("ready");
    } catch (err) {
      console.error("Loyiha yuklanmadi:", err);
      showToast("Loyiha ma\'lumotlari yuklanmadi", "error");
      setAppState("no-project");
    }
  };

  const startAutoScroll = () => {
    const tick = () => {
      if (!isDragging.current || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const x = window.mouseX || 0;
      const edge = 160;
      const speed = 14;
      if (x > rect.right - edge) boardRef.current.scrollLeft += speed;
      else if (x < rect.left + edge) boardRef.current.scrollLeft -= speed;
      scrollRAF.current = requestAnimationFrame(tick);
    };
    scrollRAF.current = requestAnimationFrame(tick);
  };

  const stopAutoScroll = () => {
    isDragging.current = false;
    if (scrollRAF.current) {
      cancelAnimationFrame(scrollRAF.current);
      scrollRAF.current = null;
    }
  };

  useEffect(() => {
    const track = (e) => {
      window.mouseX = e.clientX;
    };
    window.addEventListener("mousemove", track);
    return () => {
      window.removeEventListener("mousemove", track);
      stopAutoScroll();
    };
  }, []);

  const onDragStart = () => {
    isDragging.current = true;
    startAutoScroll();
  };

  const onDragEnd = async (result) => {
    stopAutoScroll();
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    const prev = statuses;
    setStatuses((s) => applyDrag(s, source, destination, draggableId));
    const destId = Number(destination.droppableId);
    try {
      const res = await apiFetch(
        `${API}/leeds/status/${draggableId}?statusId=${destId}`,
        { method: "PATCH" },
      );
      if (res && !res.ok) throw new Error(`PATCH ${res.status}`);
    } catch (err) {
      console.error(err);
      setStatuses(prev);
      showToast("Xatolik: o\'zgarish saqlanmadi", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        projectId: Number(currentProject.id),
        ...(formData.extraPhone && { extraPhone: formData.extraPhone }),
        ...(formData.adress && { adress: formData.adress }),
        ...(formData.budjet && { budjet: Number(formData.budjet) }),
        ...(formData.leadSourceId && {
          leadSourceId: Number(formData.leadSourceId),
        }),
        ...(formData.birthDate && { birthDate: formData.birthDate }),
        tag: formData.tags.map((t) => t.trim()).filter(Boolean),
      };
      const res = await apiFetch(`${API}/leeds`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res || !res.ok) throw new Error();
      const newLead = await res.json();
      setStatuses((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, leads: [newLead, ...s.leads] } : s,
        ),
      );
      setSheetOpen(false);
      setFormData(EMPTY_FORM);
      showToast("Lead qo\'shildi!", "success");
    } catch {
      showToast("Lead qo\'shishda xatolik", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // filter leads by search
  const q = searchQuery.trim().toLowerCase();
  const filteredStatuses = statuses.map((s) => ({
    ...s,
    leads: s.leads.filter((l) => {
      // ── Text search ──
      if (q) {
        const nameMatch = `${l.firstName ?? ""} ${l.lastName ?? ""}`
          .toLowerCase()
          .includes(q);
        const phoneMatch = (l.phone ?? "").includes(q);
        const sourceMatch = (l.leadSource?.name ?? "")
          .toLowerCase()
          .includes(q);
        const tagMatch =
          Array.isArray(l.tag) &&
          l.tag.some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !phoneMatch && !sourceMatch && !tagMatch)
          return false;
      }
      // ── Budjet ──
      if (filters.budjetMin && (l.budjet ?? 0) < Number(filters.budjetMin))
        return false;
      if (filters.budjetMax && (l.budjet ?? 0) > Number(filters.budjetMax))
        return false;
      // ── Manba ──
      if (
        filters.sourceIds.length > 0 &&
        !filters.sourceIds.includes(l.leadSourceId)
      )
        return false;
      // ── Sana ──
      if (filters.dateFrom) {
        const created = new Date(l.createdAt);
        if (created < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        const created = new Date(l.createdAt);
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59);
        if (created > to) return false;
      }
      return true;
    }),
  }));

  const totalFiltered = filteredStatuses.reduce(
    (a, s) => a + s.leads.length,
    0,
  );
  const totalAll = statuses.reduce((a, s) => a + s.leads.length, 0);
  const isFiltering = q || activeFilterCount > 0;

  if (appState === "loading") {
    return (
      <div className="flex h-full flex-col bg-[#0d1e35]">
        <div className="flex shrink-0 items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6">
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-80 shrink-0">
                <Skeleton className="mb-3 h-10 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (appState === "no-project") {
    return (
      <div className="flex h-full flex-col bg-[#0d1e35]">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6 text-white">
          <Select
            onValueChange={(name) => {
              const p = projects.find((x) => x.name === name);
              if (p) loadProject(p);
            }}
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
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          {projects.length === 0 ? (
            <>
              <AlertCircle className="h-12 w-12 text-yellow-400" />
              <p className="text-lg font-semibold text-white">
                Loyiha topilmadi
              </p>
              <p className="text-sm text-gray-400">
                Avval loyiha yarating yoki admin bilan bog\'laning.
              </p>
              <Link
                to="/projects"
                className="rounded-xl border border-blue-400 px-4 py-2 text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                Projects
              </Link>
            </>
          ) : (
            <>
              <FolderOpen className="h-14 w-14 text-blue-400" />
              <p className="text-xl font-semibold text-white">
                Loyihani tanlang
              </p>
              <div className="flex w-72 flex-col gap-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className="rounded-lg border border-[#2a4868] bg-[#11263a] px-4 py-3 text-left text-white transition-colors hover:bg-[#1a3552]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-[#0d1e35]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    >
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 border-b border-[#284860] bg-[#0f2231] px-6 py-4 text-white">
        {/* Left: project select + search */}
        <div className="flex items-center gap-3">
          <Select
            value={currentProject?.name}
            onValueChange={(name) => {
              const p = projects.find((x) => x.name === name);
              if (p) loadProject(p);
            }}
          >
            <SelectTrigger className="w-56" style={{ height: "36px" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="mt-10">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Expandable search */}
          <div className="flex items-center gap-1">
            <div
              className={`flex items-center overflow-hidden rounded-md border transition-all duration-200 ${
                searchOpen
                  ? "w-56 border-blue-500/50 bg-[#0d1e35]"
                  : "w-0 border-transparent"
              }`}
              style={{ height: "36px" }}
            >
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qidiruv..."
                className="h-full w-full bg-transparent px-3 text-sm text-white placeholder-gray-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-2 text-gray-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <IconBtn
              icon={searchOpen ? X : Search}
              label={searchOpen ? "Yopish" : "Qidiruv"}
              onClick={toggleSearch}
              iconOnly={true}
              className={searchOpen ? "border-blue-500/50 text-blue-400" : ""}
            />
          </div>
        </div>

        {/* Right: stats + action buttons */}
        <div className="flex items-center gap-2">
          {/* Mijoz soni + filter natijasi */}
          <span className="mr-2 text-xs text-gray-500">
            {isFiltering ? (
              <>
                <span className="text-white">{totalFiltered}</span>/{totalAll}{" "}
                mijoz
              </>
            ) : (
              <>{totalAll} mijoz</>
            )}
          </span>

          <IconBtn
            icon={Upload}
            label="Import"
            onClick={handleImport}
            variant="warning"
            iconOnly={searchOpen}
          />
          <IconBtn
            icon={Download}
            label="Export"
            onClick={handleExport}
            variant="success"
            iconOnly={searchOpen}
          />

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors duration-150 ${
                activeFilterCount > 0
                  ? "border-blue-500/50 bg-blue-600/10 text-blue-400"
                  : "border-[#2a4868] text-gray-300 hover:bg-[#1b3e57] hover:text-white"
              }`}
              style={{ height: "36px" }}
            >
              <SlidersHorizontal size={14} />
              {!searchOpen && <span className="whitespace-nowrap">Filter</span>}
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
              {!searchOpen && (
                <ChevronDown
                  size={12}
                  className={`transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <FilterPanel
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              filters={filters}
              onChange={setFilters}
              leadSources={leadSource}
              activeCount={activeFilterCount}
            />
          </div>

          <div className="mx-1 h-5 w-px bg-white/10" />

          <Link to="/addStatus">
            <IconBtn icon={Settings} label="Sozlamalar" iconOnly={searchOpen} />
          </Link>

          <Sheet
            open={sheetOpen}
            onOpenChange={(o) => {
              setSheetOpen(o);
              if (!o) setFormData(EMPTY_FORM);
            }}
          >
            <SheetTrigger asChild>
              <div>
                <IconBtn
                  icon={Plus}
                  label="Yangi mijoz"
                  iconOnly={searchOpen}
                />
              </div>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto bg-[#07131d] px-5">
              <SheetHeader>
                <SheetTitle className="text-white">Lead qo'shish</SheetTitle>
              </SheetHeader>
              <form className="mt-4 w-full text-white" onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Ism *</FieldLabel>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Ism"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Familiya</FieldLabel>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Familiya"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Telefon *</FieldLabel>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+998 __ ___ __ __"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Qo'shimcha</FieldLabel>
                      <Input
                        type="tel"
                        name="extraPhone"
                        value={formData.extraPhone}
                        onChange={handleChange}
                        placeholder="+998 __ ___ __ __"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Tug'ilgan sana</FieldLabel>
                    <Input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={maxBirthDate}
                    />
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      18 yoshdan katta (max: {maxBirthDate.slice(0, 4)}-yil)
                    </p>
                  </Field>
                  <Field>
                    <FieldLabel>Manzil</FieldLabel>
                    <Input
                      name="adress"
                      value={formData.adress}
                      onChange={handleChange}
                      placeholder="Manzil"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Budjet</FieldLabel>
                      <Input
                        type="number"
                        name="budjet"
                        value={formData.budjet}
                        onChange={handleChange}
                        placeholder="so'm"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Manba</FieldLabel>
                      <Select
                        value={
                          formData.leadSourceId
                            ? String(formData.leadSourceId)
                            : ""
                        }
                        onValueChange={(v) =>
                          setFormData((p) => ({
                            ...p,
                            leadSourceId: parseInt(v),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tanlang..." />
                        </SelectTrigger>
                        <SelectContent className="mt-10">
                          {leadSource.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Teg</FieldLabel>
                    <div className="flex flex-col gap-1.5">
                      {formData.tags.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Input
                            value={tag}
                            onChange={(e) => {
                              const next = [...formData.tags];
                              next[idx] = e.target.value;
                              setFormData((p) => ({ ...p, tags: next }));
                            }}
                            placeholder="VIP, comfort..."
                            className="flex-1"
                          />
                          {formData.tags.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  tags: p.tags.filter((_, i) => i !== idx),
                                }))
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-800/40 text-red-400 hover:bg-red-900/20"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, tags: [...p.tags, ""] }))
                        }
                        className="flex items-center gap-1 self-start rounded-md border border-dashed border-[#2a4868] px-2.5 py-1 text-xs text-gray-400 hover:border-blue-500/50 hover:text-white"
                      >
                        <Plus size={11} />
                        Teg qo'shish
                      </button>
                    </div>
                  </Field>
                  <Field orientation="horizontal" className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-[#07131d]"
                      onClick={() => setSheetOpen(false)}
                    >
                      Bekor
                    </Button>
                    <Button
                      type="submit"
                      className="border bg-[#07131d]"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Saqlash"
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Active filter badges ── */}
      {isFiltering && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#1a3a52] bg-[#0a1929] px-6 py-2">
          {q && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#2a4868] bg-[#0f2231] px-3 py-0.5 text-[11px] text-gray-300">
              🔍 "{q}"
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-500 hover:text-white"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {filters.budjetMin && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#2a4868] bg-[#0f2231] px-3 py-0.5 text-[11px] text-gray-300">
              Budjet ≥ {Number(filters.budjetMin).toLocaleString()}
              <button
                onClick={() => setFilters((f) => ({ ...f, budjetMin: "" }))}
                className="text-gray-500 hover:text-white"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {filters.budjetMax && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#2a4868] bg-[#0f2231] px-3 py-0.5 text-[11px] text-gray-300">
              Budjet ≤ {Number(filters.budjetMax).toLocaleString()}
              <button
                onClick={() => setFilters((f) => ({ ...f, budjetMax: "" }))}
                className="text-gray-500 hover:text-white"
              >
                <X size={11} />
              </button>
            </span>
          )}
          {filters.sourceIds.map((id) => {
            const src = leadSource.find((s) => s.id === id);
            return src ? (
              <span
                key={id}
                className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-600/10 px-3 py-0.5 text-[11px] text-blue-400"
              >
                {src.name}
                <button
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      sourceIds: f.sourceIds.filter((s) => s !== id),
                    }))
                  }
                  className="hover:text-white"
                >
                  <X size={11} />
                </button>
              </span>
            ) : null;
          })}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#2a4868] bg-[#0f2231] px-3 py-0.5 text-[11px] text-gray-300">
              📅 {filters.dateFrom || "…"} → {filters.dateTo || "…"}
              <button
                onClick={() =>
                  setFilters((f) => ({ ...f, dateFrom: "", dateTo: "" }))
                }
                className="text-gray-500 hover:text-white"
              >
                <X size={11} />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery("");
              setFilters({ ...DEFAULT_FILTERS });
            }}
            className="ml-auto text-[11px] text-red-400/70 hover:text-red-400"
          >
            Barchasini tozalash
          </button>
        </div>
      )}

      {/* ── Board ── */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div
          ref={boardRef}
          className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden p-6"
          style={{ alignItems: "flex-start" }}
        >
          {filteredStatuses.map((col) => (
            <div
              key={col.id}
              className="flex shrink-0 flex-col"
              style={{ width: 300 }}
            >
              <div
                className="mb-3 overflow-hidden rounded-lg border-b-4 bg-[#11263a]"
                style={{ borderBottomColor: col.color || "#6b7280" }}
              >
                <div className="flex items-center justify-between bg-[#153043] px-4 py-3 font-semibold text-white">
                  <span className="truncate text-sm">{col.name}</span>
                  <span className="rounded-full bg-gray-700 px-2.5 py-0.5 text-xs">
                    {col.leads.length}
                  </span>
                </div>
              </div>
              <Droppable
                droppableId={String(col.id)}
                mode="standard"
                renderClone={(provided, _snap, rubric) => {
                  const lead = col.leads[rubric.source.index];
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="rounded-lg border border-blue-400/50 bg-[#1a3552] p-3 text-sm text-white shadow-2xl ring-2 ring-blue-500/30"
                      style={{
                        ...provided.draggableProps.style,
                        opacity: 1,
                        width: 300,
                      }}
                    >
                      <div className="font-medium">
                        {lead?.firstName} {lead?.lastName}
                      </div>
                      <div className="mt-1 text-xs opacity-60">
                        {lead?.phone}
                      </div>
                    </div>
                  );
                }}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex flex-col gap-2.5 rounded-lg p-2 transition-colors duration-150 ${snapshot.isDraggingOver ? "bg-[#1a3552]/60" : ""}`}
                    style={{ minHeight: 80, overflow: "visible" }}
                  >
                    {col.leads.length === 0 ? (
                      <div
                        className={`rounded-lg border-2 border-dashed p-6 text-center text-xs transition-colors ${snapshot.isDraggingOver ? "border-blue-400/60 bg-blue-900/10 text-blue-400" : "border-[#2a4868]/40 text-gray-500"}`}
                      >
                        {snapshot.isDraggingOver
                          ? "Bu yerga tashlang"
                          : "Bo'sh"}
                      </div>
                    ) : (
                      col.leads.map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={String(lead.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() =>
                                !snapshot.isDragging &&
                                navigate(`/leadDetails?leadId=${lead.id}`)
                              }
                              className={`cursor-pointer rounded-lg border border-[#2a4868]/30 bg-[#1a3552] p-3 text-sm text-white shadow-sm transition-all duration-150 hover:bg-[#21446a] ${snapshot.isDragging ? "scale-[1.03] rotate-1 border-blue-400/50 shadow-xl ring-2 shadow-black/40 ring-blue-500/30" : ""}`}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: 1,
                              }}
                            >
                              {/* Ism */}
                              <div className="font-medium">
                                {lead.firstName} {lead.lastName}
                              </div>
                              {/* Telefon */}
                              <div className="mt-0.5 text-xs opacity-50">
                                {lead.phone}
                              </div>

                              {/* Manba */}
                              {lead.leadSource?.name && (
                                <div className="mt-1.5 text-[11px] text-blue-400/80">
                                  {lead.leadSource.name}
                                </div>
                              )}

                              {/* Taglar */}
                              {Array.isArray(lead.tag) &&
                                lead.tag.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {lead.tag.map((t, i) => (
                                      <span
                                        key={i}
                                        className="rounded border border-[#2a4868]/50 bg-[#0d2a3e] px-1.5 py-0.5 text-[10px] text-gray-300"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}

                              {/* Budjet + Tasklar */}
                              <div className="mt-2 flex items-center justify-between gap-2">
                                {lead.budjet > 0 && (
                                  <div className="text-xs text-green-400">
                                    {Number(lead.budjet).toLocaleString()} so'm
                                  </div>
                                )}
                                {Array.isArray(lead.tasks) &&
                                  lead.tasks.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-yellow-400/80">
                                      <CalendarCheck2 className="h-3 w-3" />
                                      {lead.tasks.length}
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
