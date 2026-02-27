import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Search,
  Trash2,
  Phone,
  User,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMAGE_BASE = "https://back.prohome.uz/api/v1/image";

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  return `${IMAGE_BASE}/${src}`;
}

// ── API statuslar ─────────────────────────────────────────────────────────
const API_STATUSES = {
  STARTED: { label: "Jarayonda", color: "#f59e0b" },
  PENDING: { label: "Kutilmoqda", color: "#6b7280" },
  FINISHED: { label: "Bajarildi", color: "#10b981" },
};

const TYPES = {
  task: { label: "Vazifa", color: "#3b82f6" },
  call: { label: "Qo'ng'iroq", color: "#10b981" },
  meeting: { label: "Uchrashuv", color: "#8b5cf6" },
};

// ── Helpers ───────────────────────────────────────────────────────────────
function isOverdue(dateStr, status) {
  if (status === "FINISHED" || !dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
  });
}

function formatPhone(phone) {
  if (!phone) return null;
  return phone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
}

// ── Avatar (harf yoki rasm) ───────────────────────────────────────────────
function Avatar({ name, size = 7 }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  const clrs = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];
  const idx = name ? name.charCodeAt(0) % clrs.length : 0;
  return (
    <div
      className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white`}
      style={{ background: clrs[idx] }}
    >
      {initials}
    </div>
  );
}

// ── LeadSource icon (Instagram/Telegram rasm yoki fallback) ──────────────
function SourceIcon({ source }) {
  if (!source) return null;
  const url = getImageUrl(source.icon);
  if (url) {
    return (
      <img
        src={url}
        alt={source.name}
        title={source.name}
        className="h-4 w-4 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-gray-500">
      {source.name}
    </span>
  );
}

// ── Task Row ──────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete, style }) {
  const overdue = isOverdue(task.taskDate, task.status);
  const isDone = task.status === "FINISHED";
  const type = TYPES[task.type] || TYPES.task;
  const statusInfo = API_STATUSES[task.status] || API_STATUSES.PENDING;

  // Lead ma'lumotlari
  const lead = task.lead;
  const leadName = lead
    ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
    : null;
  const leadPhone = lead?.phone;
  const leadSource = lead?.leadSource;
  const leadStatus = lead?.status;
  const assignedUser = lead?.assignedUser || task.assignedUser;
  const remaining = task.taskRemainingDays ?? lead?.taskRemainingDays;

  return (
    <div
      className={`group rounded-xl border transition-all duration-150 ${
        isDone
          ? "border-white/3 bg-white/1 opacity-55"
          : "border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/5"
      }`}
      style={style}
    >
      {/* ── Top row ── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Toggle */}
        <button
          onClick={() => onToggle(task)}
          className="shrink-0 transition-transform hover:scale-110"
        >
          {isDone ? (
            <CheckCircle2 size={17} className="text-green-500" />
          ) : (
            <Circle size={17} className="text-gray-600 hover:text-blue-400" />
          )}
        </button>

        {/* Type dot */}
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: type.color, boxShadow: `0 0 5px ${type.color}` }}
        />

        {/* Task description */}
        <p
          className={`min-w-0 flex-1 truncate text-sm font-medium ${isDone ? "text-gray-500 line-through" : "text-white"}`}
        >
          {task.description}
        </p>

        {/* Status badge */}
        <span
          className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold"
          style={{
            color: statusInfo.color,
            background: `${statusInfo.color}18`,
          }}
        >
          {statusInfo.label}
        </span>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 text-gray-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Lead info row (faqat lead bo'lsa) ── */}
      {(leadName ||
        leadPhone ||
        assignedUser ||
        leadSource ||
        leadStatus ||
        task.taskDate) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.04] px-4 py-2">
          {/* Mijoz ismi + lead statusi */}
          {leadName && (
            <div className="flex items-center gap-1.5">
              <Avatar name={leadName} size={5} />
              <span className="text-xs font-medium text-gray-300">
                {leadName}
              </span>
              {leadStatus && (
                <span
                  className="rounded px-1.5 py-px text-[9px] font-semibold"
                  style={{
                    color: leadStatus.color || "#94a3b8",
                    background: `${leadStatus.color || "#94a3b8"}20`,
                  }}
                >
                  {leadStatus.name}
                </span>
              )}
            </div>
          )}

          {/* Telefon */}
          {leadPhone && (
            <a
              href={`tel:${leadPhone}`}
              className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-blue-400"
            >
              <Phone size={10} />
              {formatPhone(leadPhone)}
            </a>
          )}

          {/* Manba (Instagram/Telegram icon) */}
          {leadSource && (
            <div className="flex items-center gap-1">
              <SourceIcon source={leadSource} />
              <span className="text-[10px] text-gray-600">
                {leadSource.name}
              </span>
            </div>
          )}

          {/* Mas'ul xodim */}
          {assignedUser?.fullName && (
            <div className="flex items-center gap-1 text-[10px] text-gray-600">
              <User size={10} />
              {assignedUser.fullName}
            </div>
          )}

          {/* Qolgan kunlar */}
          {remaining != null && remaining > 0 && !isDone && (
            <div
              className={`flex items-center gap-1 text-[10px] ${remaining <= 1 ? "text-red-400" : "text-gray-600"}`}
            >
              <Clock size={10} />
              {remaining} kun qoldi
            </div>
          )}

          {/* Sana */}
          {task.taskDate && (
            <div
              className={`flex items-center gap-1 text-xs ${overdue ? "text-red-400" : "text-gray-600"}`}
            >
              {overdue && <AlertCircle size={10} />}
              <Calendar size={10} />
              {formatDate(task.taskDate)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Tasks() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  console.log(tasks);

  // ── Fetch tasks ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !projectId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/tasks/${projectId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : (data.data ?? []));
        }
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlar yuklanmadi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Toggle ───────────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    const newStatus = task.status === "FINISHED" ? "STARTED" : "FINISHED";
    setTasks((p) =>
      p.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((p) =>
        p.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      );
      toast.error("Xatolik yuz berdi");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));
    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Vazifa o'chirildi ✅");
    } catch {
      setTasks(prev);
      toast.error("O'chirishda xato ❌");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const filtered = tasks.filter((t) => {
    const taskDay = t.taskDate ? t.taskDate.slice(0, 10) : "";
    const leadName = t.lead
      ? `${t.lead.firstName || ""} ${t.lead.lastName || ""}`.toLowerCase()
      : "";
    if (
      search &&
      !t.description?.toLowerCase().includes(search.toLowerCase()) &&
      !leadName.includes(search.toLowerCase())
    )
      return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (activeTab === "today" && taskDay !== today) return false;
    if (activeTab === "overdue" && !isOverdue(t.taskDate, t.status))
      return false;
    return true;
  });

  const stats = {
    today: tasks.filter(
      (t) => t.taskDate?.slice(0, 10) === today && t.status !== "FINISHED",
    ).length,
    overdue: tasks.filter((t) => isOverdue(t.taskDate, t.status)).length,
    all: tasks.length,
  };

  const active = filtered.filter((t) => t.status !== "FINISHED");
  const done = filtered.filter((t) => t.status === "FINISHED");

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-[#071828]">
        <div className="border-b border-white/5 px-6 py-4">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-white/5" />
        </div>
        <div className="flex flex-col gap-2 p-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-white/[0.03]"
                style={{ animationDelay: `${i * 0.07}s` }}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#071828]">
      {/* Grid bg */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-white/5 bg-[#071828]/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Vazifalar</h1>
            <p className="text-xs text-gray-600">{stats.all} ta vazifa</p>
          </div>

          {/* Search — ism yoki tavsif bo'yicha */}
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/5 bg-white/3 px-3 py-2">
            <Search size={14} className="shrink-0 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Vazifa yoki mijoz ismi..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
          </div>
        </div>

        {/* Tabs + Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {[
            { key: "all", label: "Barchasi", count: stats.all, alert: false },
            {
              key: "today",
              label: "Bugun",
              count: stats.today,
              alert: stats.today > 0,
            },
            {
              key: "overdue",
              label: "Muddati o'tgan",
              count: stats.overdue,
              alert: stats.overdue > 0,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab.alert
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-white/5" />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/3 px-2 py-1.5 text-xs text-gray-400 outline-none"
          >
            <option value="all">Barcha holat</option>
            {Object.entries(API_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Task list ──────────────────────────────────────────────── */}
      <div className="scrollbar-hide relative flex-1 overflow-y-auto px-6 py-4">
        {active.length === 0 && done.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <CheckCircle2 size={40} className="text-gray-700" />
            <p className="text-sm font-medium text-gray-500">
              Vazifalar topilmadi
            </p>
            <p className="text-xs text-gray-700">
              Filter o'zgartiring yoki yangi vazifa qo'shing
            </p>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">
              Bajarilishi kerak — {active.length}
            </p>
            <div className="flex flex-col gap-2">
              {active.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  style={{ animation: `taskIn .3s ease ${i * 0.04}s both` }}
                />
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-700 uppercase">
              Bajarildi — {done.length}
            </p>
            <div className="flex flex-col gap-2">
              {done.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  style={{ animation: `taskIn .3s ease ${i * 0.04}s both` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes taskIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
