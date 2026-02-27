import { useEffect, useState, useRef } from "react";
import {
  Phone,
  MapPin,
  Tag,
  MessageSquare,
  ChevronLeft,
  MoreVertical,
  HandCoins,
  SendHorizonal,
  Calendar,
  MessageCircle,
  CheckSquare,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMonthYear = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    month: "long",
    year: "numeric",
  });
};

// Task muddati o'tganmi yoki yaqinmi?
const getTaskStatus = (taskDate) => {
  if (!taskDate) return null;
  const now = new Date();
  const due = new Date(taskDate);
  const diffMs = due - now;
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffMs < 0) return "overdue"; // o'tib ketgan
  if (diffH < 24) return "soon"; // 24 soat qolgan
  return "ok";
};

const maxBirthDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

// ─────────────────────────────────────────────────────────────────────────
// EVENT CONFIG
// ─────────────────────────────────────────────────────────────────────────
const EVENT_CFG = {
  Description: { icon: MessageCircle, color: "#3b82f6", label: "Izoh" },
  tasks: { icon: CheckSquare, color: "#10b981", label: "Task" },
  message: { icon: MessageSquare, color: "#3b82f6", label: "Xabar" },
  status_change: {
    icon: ArrowRightLeft,
    color: "#8b5cf6",
    label: "Status o'zgardi",
  },
  default: { icon: Tag, color: "#6b7280", label: "Hodisa" },
};
const getCfg = (type) => EVENT_CFG[type] || EVENT_CFG.default;

const INPUT_TYPES = [
  {
    value: "Description",
    label: "Izoh",
    icon: MessageCircle,
    color: "#3b82f6",
    placeholder: "Izoh yozing...",
  },
  {
    value: "tasks",
    label: "Task",
    icon: CheckSquare,
    color: "#10b981",
    placeholder: "Vazifani kiriting...",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// EVENT CARD  ← asosiy o'zgarish
// ─────────────────────────────────────────────────────────────────────────
function EventCard({ event }) {
  const cfg = getCfg(event.type);
  const Icon = cfg.icon;
  const isTask = event.type === "tasks";
  const taskStatus = isTask ? getTaskStatus(event.taskDate) : null;

  const taskStatusCfg = {
    overdue: {
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.2)",
      icon: AlertCircle,
      label: "Muddati o'tgan",
    },
    soon: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
      icon: Clock,
      label: "Yaqinlashmoqda",
    },
    ok: {
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.18)",
      icon: CheckCircle2,
      label: "Rejalashtirilgan",
    },
  };
  const tsCfg = taskStatus ? taskStatusCfg[taskStatus] : null;

  return (
    <div className="group flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}28`,
          }}
        >
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
        <div
          className="w-px flex-1 bg-white/[0.04]"
          style={{ minHeight: 12 }}
        />
      </div>

      {/* Card */}
      <div
        className="mb-3 flex-1 overflow-hidden rounded-xl border border-white/[0.05] p-4 transition-colors group-hover:bg-white/[0.02]"
        style={{
          background: isTask
            ? "rgba(16,185,129,0.03)"
            : "rgba(255,255,255,0.015)",
          borderLeft: `2px solid ${cfg.color}35`,
        }}
      >
        {/* Header row */}
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type badge */}
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
              style={{ color: cfg.color, background: `${cfg.color}15` }}
            >
              {cfg.label}
            </span>

            {/* Task status badge */}
            {isTask && tsCfg && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: tsCfg.color,
                  background: tsCfg.bg,
                  border: `1px solid ${tsCfg.border}`,
                }}
              >
                <tsCfg.icon size={9} />
                {tsCfg.label}
              </span>
            )}

            {event.user?.role && (
              <span className="text-xs text-gray-600">{event.user.role}</span>
            )}
          </div>

          {/* Created time */}
          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <Clock size={10} />
            {formatDateTime(event.createdAt)}
          </div>
        </div>

        {/* Text */}
        <p className="text-sm leading-relaxed text-gray-300">
          {event.text || event.description}
        </p>

        {/* ── Task footer: muddat + tegli ko'rinish ── */}
        {isTask && (
          <div
            className="mt-3 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
            style={{
              background: tsCfg ? tsCfg.bg : "rgba(16,185,129,0.06)",
              border: `1px solid ${tsCfg ? tsCfg.border : "rgba(16,185,129,0.15)"}`,
            }}
          >
            <div className="flex items-center gap-2">
              <Calendar
                size={13}
                style={{ color: tsCfg ? tsCfg.color : "#10b981" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: tsCfg ? tsCfg.color : "#10b981" }}
              >
                Muddat:
              </span>
              <span className="text-xs font-bold text-white">
                {event.taskDate
                  ? formatDateTime(event.taskDate)
                  : "Belgilanmagan"}
              </span>
            </div>
            {tsCfg && (
              <tsCfg.icon
                size={14}
                style={{ color: tsCfg.color, flexShrink: 0 }}
              />
            )}
          </div>
        )}

        {/* ── Description footer: tegli ko'rinish ── */}
        {!isTask && event.tags && event.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {event.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// INPUT BAR
// ─────────────────────────────────────────────────────────────────────────
// ─── Inline 24h DateTimePicker ───────────────────────────────────────────────
function TaskDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const parsed = value ? new Date(value) : null;
  const today = new Date();

  const [viewYear, setViewYear] = useState(
    parsed ? parsed.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed ? parsed.getMonth() : today.getMonth(),
  );
  const [selDay, setSelDay] = useState(parsed ? parsed.getDate() : null);
  const [hour, setHour] = useState(parsed ? parsed.getHours() : 9);
  const [minute, setMinute] = useState(parsed ? parsed.getMinutes() : 0);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const MONTHS = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyn",
    "Iyl",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];
  const WDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const pad = (n) => String(n).padStart(2, "0");

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = (() => {
    const d = new Date(viewYear, viewMonth, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const isPast = (d) =>
    new Date(viewYear, viewMonth, d) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () =>
    viewMonth === 0
      ? (setViewMonth(11), setViewYear((y) => y - 1))
      : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11
      ? (setViewMonth(0), setViewYear((y) => y + 1))
      : setViewMonth((m) => m + 1);

  const confirm = () => {
    if (!selDay) return;
    // "2025-06-15T14:30:00" — ISO 8601 local, backend new Date() bilan parse qiladi
    const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(selDay)}T${pad(hour)}:${pad(minute)}:00`;
    onChange(iso);
    setOpen(false);
  };

  const displayLabel = value
    ? (() => {
        const d = new Date(value);
        return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })()
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all"
        style={{
          borderColor: value
            ? "rgba(16,185,129,0.35)"
            : "rgba(255,255,255,0.07)",
          background: value
            ? "rgba(16,185,129,0.07)"
            : "rgba(255,255,255,0.03)",
          color: value ? "#e2ffe8" : "#6b7280",
        }}
      >
        <Calendar size={13} style={{ color: value ? "#10b981" : "#4b5563" }} />
        <span>{displayLabel || "Muddat tanlang"}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="ml-1 cursor-pointer text-gray-500 transition-colors hover:text-red-400"
          >
            ✕
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl shadow-2xl"
          style={{
            width: 272,
            background: "#0a1929",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-6 w-6 items-center justify-center rounded text-base text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              ‹
            </button>
            <span className="text-xs font-semibold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-6 w-6 items-center justify-center rounded text-base text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              ›
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {WDAYS.map((d) => (
              <div
                key={d}
                className="py-0.5 text-center text-[9px] font-bold text-gray-700 uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
            {Array(firstDay)
              .fill(null)
              .map((_, i) => (
                <div key={`e${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const past = isPast(d);
              const isSel = selDay === d;
              const isToday =
                d === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              return (
                <button
                  key={d}
                  type="button"
                  disabled={past}
                  onClick={() => setSelDay(d)}
                  className="aspect-square rounded-md text-[11px] transition-all"
                  style={{
                    background: isSel
                      ? "#10b981"
                      : isToday
                        ? "rgba(16,185,129,0.12)"
                        : "transparent",
                    color: isSel
                      ? "#fff"
                      : past
                        ? "#1e3a4a"
                        : isToday
                          ? "#10b981"
                          : "#c8dce8",
                    fontWeight: isSel || isToday ? 700 : 400,
                    cursor: past ? "not-allowed" : "pointer",
                    border:
                      isToday && !isSel
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid transparent",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* 24h time sliders */}
          <div className="space-y-2.5 border-t border-white/[0.05] px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-right text-[10px] text-gray-600">
                Soat
              </span>
              <input
                type="range"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(+e.target.value)}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
                style={{
                  accentColor: "#10b981",
                  background: `linear-gradient(to right,#10b981 ${(hour / 23) * 100}%,#162840 ${(hour / 23) * 100}%)`,
                }}
              />
              <span className="w-7 shrink-0 text-xs font-bold text-white tabular-nums">
                {pad(hour)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-right text-[10px] text-gray-600">
                Daqiqa
              </span>
              <input
                type="range"
                min={0}
                max={59}
                step={5}
                value={minute}
                onChange={(e) => setMinute(+e.target.value)}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
                style={{
                  accentColor: "#10b981",
                  background: `linear-gradient(to right,#10b981 ${(minute / 59) * 100}%,#162840 ${(minute / 59) * 100}%)`,
                }}
              />
              <span className="w-7 shrink-0 text-xs font-bold text-white tabular-nums">
                {pad(minute)}
              </span>
            </div>
            {/* Quick time buttons */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {[
                [9, 0],
                [10, 0],
                [12, 0],
                [14, 0],
                [16, 0],
                [18, 0],
              ].map(([h, m]) => (
                <button
                  key={`qt${h}${m}`}
                  type="button"
                  onClick={() => {
                    setHour(h);
                    setMinute(m);
                  }}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold transition-colors"
                  style={{
                    background:
                      hour === h && minute === m
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(255,255,255,0.05)",
                    color: hour === h && minute === m ? "#10b981" : "#4b6070",
                    border: `1px solid ${hour === h && minute === m ? "rgba(16,185,129,0.3)" : "transparent"}`,
                  }}
                >
                  {pad(h)}:{pad(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm footer */}
          <div
            className="flex items-center justify-between border-t border-white/[0.05] px-3 py-2"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="text-[11px] text-gray-600">
              {selDay
                ? `${selDay} ${MONTHS[viewMonth]}, ${pad(hour)}:${pad(minute)}`
                : "Kun tanlanmagan"}
            </span>
            <button
              type="button"
              onClick={confirm}
              disabled={!selDay}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-all"
              style={{
                background: selDay ? "#10b981" : "#162840",
                color: selDay ? "#fff" : "#2a4560",
                cursor: selDay ? "pointer" : "not-allowed",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── InputBar ─────────────────────────────────────────────────────────────────
function InputBar({ onSubmit, sending }) {
  const [text, setText] = useState("");
  const [type, setType] = useState(INPUT_TYPES[0]);
  const [taskDate, setTaskDate] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  }, [text]);

  const handleTypeChange = (t) => {
    setType(t);
    if (t.value !== "tasks") setTaskDate("");
  };

  const submit = () => {
    if (!text.trim() || sending) return;
    onSubmit(text.trim(), type.value, taskDate || null);
    setText("");
    setTaskDate("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const TypeIcon = type.icon;
  const isTask = type.value === "tasks";

  return (
    <div
      className="sticky bottom-0 z-10 border-t px-5 py-4"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "linear-gradient(to top, #071828 70%, rgba(7,24,40,0.88))",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mx-auto max-w-3xl space-y-2.5">
        {/* Type tabs + date picker */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            {INPUT_TYPES.map((t) => {
              const TIcon = t.icon;
              const active = type.value === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t)}
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all"
                  style={{
                    color: active ? t.color : "#4b5563",
                    background: active ? `${t.color}12` : "transparent",
                    border: `1px solid ${active ? `${t.color}25` : "transparent"}`,
                  }}
                >
                  <TIcon size={12} />
                  {t.label}
                  {active && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: t.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom 24h picker — faqat task tanlanganda */}
          {isTask && <TaskDatePicker value={taskDate} onChange={setTaskDate} />}

          <span className="ml-auto text-[11px] text-gray-700">Ctrl+Enter</span>
        </div>

        {/* Textarea + send button */}
        <div className="flex items-end gap-2.5">
          <div
            className="flex flex-1 items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200"
            style={{
              background: "#0c1e2e",
              border: `1px solid ${text ? `${type.color}30` : "rgba(255,255,255,0.06)"}`,
              boxShadow: text ? `0 0 0 3px ${type.color}08` : "none",
            }}
          >
            <TypeIcon
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: text ? type.color : "#374151" }}
            />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
              }}
              placeholder={type.placeholder}
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              style={{ lineHeight: "1.6", maxHeight: 130 }}
            />
          </div>

          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              background: text.trim()
                ? `linear-gradient(135deg, ${type.color}, ${type.color}88)`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${text.trim() ? `${type.color}35` : "rgba(255,255,255,0.05)"}`,
              boxShadow: text.trim() ? `0 4px 16px ${type.color}35` : "none",
            }}
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <span>Yuborish</span>
                <SendHorizonal size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────
const LeadDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [dealData, setDealData] = useState(null);
  const [events, setEvents] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [activeTab, setActiveTab] = useState("asosiy");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // userId — localStorage dan
  const userId = localStorage.getItem("projectId");

  // Description + Task larni birlashtirib, createdAt bo'yicha saralab qaytaradi
  const mergeEvents = (descs, tasks) => {
    const descList = (Array.isArray(descs) ? descs : []).map((d) => ({
      ...d,
      type: d.type || "Description",
    }));
    const taskList = (Array.isArray(tasks) ? tasks : []).map((t) => ({
      ...t,
      type: "tasks",
      text: t.description || t.text,
    }));
    return [...descList, ...taskList].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
  };

  useEffect(() => {
    if (!token || !leadId) return;
    const init = async () => {
      try {
        const requests = [
          fetch(`${API}/leeds/${leadId}`, { headers }),
          fetch(`${API}/Description/lead/${leadId}?projectId=${projectId}`, {
            headers,
          }),
          fetch(`${API}/lead-source/${projectId}`, { headers }),
          ...(userId ? [fetch(`${API}/tasks/${userId}`, { headers })] : []),
        ];
        const [leadRes, descRes, sourceRes, taskRes] =
          await Promise.all(requests);

        if (leadRes.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const [lead, descs, sources, tasks] = await Promise.all([
          leadRes.json(),
          descRes.ok ? descRes.json() : [],
          sourceRes.ok ? sourceRes.json() : [],
          taskRes?.ok ? taskRes.json() : [],
        ]);

        setDealData(lead);
        setLeadSource(Array.isArray(sources) ? sources : []);

        // Faqat shu leadga tegishli tasklarni filtrlaymiz
        const leadTasks = (Array.isArray(tasks) ? tasks : []).filter(
          (t) => String(t.leadsId) === String(leadId),
        );
        setEvents(mergeEvents(descs, leadTasks));
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlar yuklanmadi");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshEvents = async () => {
    try {
      const requests = [
        fetch(`${API}/Description/lead/${leadId}?projectId=${projectId}`, {
          headers,
        }),
        ...(userId ? [fetch(`${API}/tasks/${userId}`, { headers })] : []),
      ];
      const [descRes, taskRes] = await Promise.all(requests);
      const descs = descRes?.ok ? await descRes.json() : [];
      const tasks = taskRes?.ok ? await taskRes.json() : [];
      const leadTasks = (Array.isArray(tasks) ? tasks : []).filter(
        (t) => String(t.leadsId) === String(leadId),
      );
      setEvents(mergeEvents(descs, leadTasks));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDesc = async (text, type, date) => {
    console.log(date);

    setSending(true);
    try {
      if (type === "tasks") {
        const body = {
          projectId: Number(projectId),
          leadsId: Number(leadId),
          description: text,
          ...(date && { date }), // "2025-06-15T14:30:00" — ISO 8601
        };

        console.log(body);

        const res = await fetch(`${API}/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`${API}/Description`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectId: Number(projectId),
            leadsId: Number(leadId),
            text,
          }),
        });
        if (!res.ok) throw new Error();
      }
      await refreshEvents();
      toast.success(
        type === "tasks" ? "Task qo'shildi ✅" : "Izoh qo'shildi ✅",
      );
    } catch {
      toast.error("Yuborishda xato ❌");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDealData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      firstName: dealData.firstName,
      lastName: dealData.lastName,
      phone: dealData.phone,
      extraPhone: dealData.extraPhone,
      adress: dealData.adress,
      budjet: Number(dealData.budjet),
      leadSourceId: Number(dealData.leadSourceId),
      projectId: Number(projectId),
      tag: dealData.tag,
      birthDate: dealData.birthDate
        ? new Date(dealData.birthDate).toISOString().split("T")[0]
        : undefined,
    };
    toast.promise(
      fetch(`${API}/leeds/${leadId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error();
      }),
      {
        loading: "Saqlanmoqda...",
        success: "Yangilandi ✅",
        error: "Xatolik ❌",
      },
    );
  };

  // ── LOADING ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#071828] text-gray-200">
        <div className="flex w-96 shrink-0 flex-col border-r border-white/[0.05] bg-[#0a1929]">
          <div className="border-b border-white/[0.05] p-5">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-xl bg-white/5" />
              <Skeleton className="h-5 w-28 rounded-lg bg-white/5" />
            </div>
          </div>
          <div className="space-y-4 p-5">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-full rounded-xl bg-white/[0.03]"
                />
              ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-3 p-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-xl bg-white/[0.03]"
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dealData) return null;

  // ── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#071828] text-gray-200">
      {/* ═══ LEFT PANEL ═══ */}
      <div
        className="flex w-96 shrink-0 flex-col overflow-hidden border-r"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a1929" }}
      >
        {/* Header */}
        <div
          className="shrink-0 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <h1 className="text-base font-semibold text-white">
                Bitim #{dealData.id}
              </h1>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:text-white">
              <MoreVertical size={15} />
            </button>
          </div>
          {dealData.tag && (
            <span
              className="inline-block rounded-lg px-3 py-1 text-xs font-medium"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              #{dealData.tag}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          className="shrink-0 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#7c3aed)" }}
            >
              {dealData.firstName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-white">
                {dealData.firstName} {dealData.lastName}
              </p>
              <p className="text-xs text-gray-600">#{dealData.id} mijoz</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {["Asosiy", "Tahrirlash"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className="flex-1 border-b-2 py-3 text-xs font-semibold transition-all"
              style={{
                borderBottomColor:
                  activeTab === tab.toLowerCase() ? "#3b82f6" : "transparent",
                color: activeTab === tab.toLowerCase() ? "#60a5fa" : "#6b7280",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {activeTab === "asosiy" && (
            <div className="space-y-4 p-5">
              <InfoRow label="Loyiha" value={dealData?.project?.name} />
              <InfoRow
                label="Operator"
                value={dealData?.assignedUser?.fullName}
              />
              <InfoRow label="Manba" value={dealData?.leadSource?.name} />
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Budjet
                </p>
                <div className="flex items-center gap-2">
                  <HandCoins size={14} className="text-yellow-400" />
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(dealData.budjet)}
                  </p>
                </div>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="space-y-3">
                  <PhoneRow label="Tel raqam" value={dealData.phone} />
                  <PhoneRow
                    label="Qo'shimcha raqam"
                    value={dealData.extraPhone}
                  />
                  <div>
                    <p className="text-[11px] text-gray-600">Tug'ilgan sana</p>
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={13}
                        className="shrink-0 text-yellow-400"
                      />
                      <p className="text-sm text-white">
                        {formatDate(dealData.birthDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Manzil</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="shrink-0 text-red-400" />
                      <p className="text-sm text-white">
                        {dealData.adress || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tahrirlash" && (
            <form className="p-5 text-white" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Ism</FieldLabel>
                    <Input
                      name="firstName"
                      value={dealData.firstName || ""}
                      onChange={handleChange}
                      placeholder="Ism"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Familiya</FieldLabel>
                    <Input
                      name="lastName"
                      value={dealData.lastName || ""}
                      onChange={handleChange}
                      placeholder="Familiya"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Tug'ilgan sana</FieldLabel>
                  <Input
                    type="date"
                    name="birthDate"
                    value={dealData.birthDate?.slice(0, 10) ?? ""}
                    onChange={handleChange}
                    max={maxBirthDate}
                  />
                  <p className="mt-0.5 text-[11px] text-gray-600">
                    18 yoshdan katta (max: {maxBirthDate.slice(0, 4)}-yil)
                  </p>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Telefon</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      value={dealData.phone || ""}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Qo'shimcha</FieldLabel>
                    <Input
                      type="tel"
                      name="extraPhone"
                      value={dealData.extraPhone || ""}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Manzil</FieldLabel>
                  <Input
                    name="adress"
                    value={dealData.adress || ""}
                    onChange={handleChange}
                    placeholder="Manzil"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Budjet</FieldLabel>
                    <Input
                      type="number"
                      name="budjet"
                      value={dealData.budjet || ""}
                      onChange={handleChange}
                      placeholder="so'm"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Manba</FieldLabel>
                    <Select
                      value={
                        dealData.leadSourceId
                          ? String(dealData.leadSourceId)
                          : ""
                      }
                      onValueChange={(v) =>
                        setDealData((prev) => ({
                          ...prev,
                          leadSourceId: parseInt(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="mt-2">
                        {leadSource.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Teg</FieldLabel>
                  <Input
                    name="tag"
                    value={dealData.tag || ""}
                    onChange={handleChange}
                    placeholder="Teg..."
                  />
                </Field>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("asosiy")}
                    className="flex-1 text-gray-400 hover:text-white"
                  >
                    Bekor
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                  >
                    Saqlash
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Status badge */}
        <div
          className="flex shrink-0 items-center justify-end border-b px-5 py-3"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "#071828",
          }}
        >
          {dealData?.status && (
            <div
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
              style={{
                background: dealData.status.color || "#3b82f6",
                boxShadow: `0 2px 12px ${dealData.status.color || "#3b82f6"}50`,
              }}
            >
              {dealData.status.name}
            </div>
          )}
        </div>

        {/* Events feed */}
        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-2xl">
            {dealData.createdAt && (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.04]" />
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1 text-xs text-gray-600">
                    {formatMonthYear(dealData.createdAt)}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.04]" />
                </div>
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-700">
                  <Tag size={10} />
                  {formatDateTime(dealData.createdAt)} • Lead yaratildi
                </div>
              </>
            )}

            {events.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <MessageSquare size={36} className="text-gray-800" />
                <p className="text-sm text-gray-600">Hali faoliyat yo'q</p>
                <p className="text-xs text-gray-700">
                  Izoh yoki task qo'shish uchun pastdagi maydondan foydalaning
                </p>
              </div>
            ) : (
              events.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </div>
        </div>

        <InputBar onSubmit={handlePostDesc} sending={sending} />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ─── Kichik yordamchi componentlar ───────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] text-gray-600 uppercase">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  );
}
function PhoneRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-600">{label}</p>
      <div className="flex items-center gap-2">
        <Phone size={13} className="shrink-0 text-blue-400" />
        {value ? (
          <a
            href={`tel:${value}`}
            className="text-sm text-blue-400 hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-gray-600">—</span>
        )}
      </div>
    </div>
  );
}

export default LeadDetails;
