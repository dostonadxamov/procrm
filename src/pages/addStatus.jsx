import { useState, useEffect } from "react";
import { Plus, Trash2, Pen, RefreshCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../components/ui/button";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const COLORS = [
  "#4B0082",
  "#CC7722",
  "#006400",
  "#0D1B2A",
  "#8b5cf6",
  "#800000",
  "#2F4F4F",
  "#5C4033",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function AddStatus() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ true boshlanishida

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [addLoading, setAddLoading] = useState(false);

  // Update form (dialog state per column)
  const [editId, setEditId] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updateColor, setUpdateColor] = useState("#3b82f6");
  const [updateLoading, setUpdateLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (!projectId) {
      setLoading(false);
      return;
    }
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const res = await fetch(`${API}/status/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setColumns(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Ustunlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  // ── ADD ──────────────────────────────────────────────────────────────────
  const addColumn = async () => {
    if (!newName.trim()) return;
    setAddLoading(true);

    const body = {
      name: newName.trim().toUpperCase(),
      projectId: Number(projectId), // ✅ companyId emas — projectId
      color: newColor,
    };

    // Optimistic
    const tempId = Date.now();
    const tempCol = {
      id: tempId,
      name: body.name,
      color: body.color,
      _temp: true,
    };
    setColumns((prev) => [...prev, tempCol]);
    setShowAddForm(false);
    setNewName("");
    setNewColor("#3b82f6");

    try {
      const res = await fetch(`${API}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Temp ni haqiqiy bilan almashtir
      setColumns((prev) =>
        prev.map((c) => (c.id === tempId ? { ...data } : c)),
      );
      toast.success("Status qo'shildi ✅");
    } catch {
      // Rollback
      setColumns((prev) => prev.filter((c) => c.id !== tempId));
      toast.error("Qo'shishda xato ❌");
      setShowAddForm(true);
      setNewName(body.name);
    } finally {
      setAddLoading(false);
    }
  };

  // ── DELETE ───────────────────────────────────────────────────────────────
  const deleteColumn = async (columnId) => {
    // Optimistic
    const prev = columns;
    setColumns((c) => c.filter((col) => col.id !== columnId));

    try {
      const res = await fetch(`${API}/status/${columnId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "O'chirishda xato");
      }
      toast.success("Status o'chirildi ✅");
    } catch (err) {
      setColumns(prev); // rollback
      toast.error(err.message || "O'chirishda xato ❌");
    }
  };

  // ── UPDATE ───────────────────────────────────────────────────────────────
  const updateColumn = async (columnId) => {
    if (!updateName.trim()) return;
    setUpdateLoading(true);

    const body = { name: updateName.trim(), color: updateColor };

    // Optimistic
    const prev = columns;
    setColumns((c) =>
      c.map((col) => (col.id === columnId ? { ...col, ...body } : col)),
    );
    setEditId(null);

    try {
      const res = await fetch(`${API}/status/${columnId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Status yangilandi ✅");
    } catch {
      setColumns(prev); // rollback
      toast.error("Yangilashda xato ❌");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto bg-[#0a1929] p-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-72 shrink-0">
              <Skeleton className="mb-3 h-12 w-full rounded-lg bg-[#1c2b3a]" />
              <Skeleton className="h-48 w-full rounded-lg bg-[#1c2b3a]" />
            </div>
          ))}
      </div>
    );
  }

  // ── Loyiha yo'q ───────────────────────────────────────────────────────────
  if (!projectId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0a1929] text-gray-400">
        Pipeline sahifasidan loyihani tanlang
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1929]">
      <div className="scrollbar-hide flex flex-1 gap-0 overflow-x-auto">
        {/* ── Columns ──────────────────────────────────────────────────── */}
        {columns.map((column) => (
          <div
            key={column.id}
            className="relative flex h-full w-70 shrink-0 flex-col border-r border-[#1a3a52]"
          >
            {/* Header */}
            <div
              className="shrink-0 bg-[#0f2942]"
              style={{ borderBottom: `4px solid ${column.color || "#6b7280"}` }}
            >
              <div className="flex items-center justify-between border-b border-[#1a3a52] px-3 py-3">
                <h2 className="text-xs font-semibold tracking-wide text-white uppercase">
                  {column.name}
                  {column._temp && (
                    <span className="ml-2 text-[10px] text-gray-500">
                      saqlanmoqda...
                    </span>
                  )}
                </h2>

                <div className="flex items-center gap-2">
                  {/* Delete */}
                  <button
                    onClick={() => deleteColumn(column.id)}
                    disabled={!!column._temp}
                    className="text-gray-400 transition-colors hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Edit dialog */}
                  <Dialog
                    open={editId === column.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditId(column.id);
                        setUpdateName(column.name);
                        setUpdateColor(column.color || "#3b82f6");
                      } else {
                        setEditId(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <button
                        disabled={!!column._temp}
                        className="text-gray-400 transition-colors hover:text-blue-400 disabled:opacity-30"
                      >
                        <Pen size={15} />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f2231] text-white">
                      <DialogHeader>
                        <DialogTitle>Statusni tahrirlash</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateColumn(column.id);
                        }}
                        className="space-y-4 pt-2"
                      >
                        <input
                          type="text"
                          value={updateName}
                          onChange={(e) => setUpdateName(e.target.value)}
                          placeholder="Nom kiriting..."
                          className="w-full rounded-lg border border-[#2a4a62] bg-[#1a3a52] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <div>
                          <p className="mb-2 text-xs text-gray-400">Rang</p>
                          <div className="grid grid-cols-8 gap-2">
                            {COLORS.map((c) => (
                              <button
                                type="button"
                                key={c}
                                onClick={() => setUpdateColor(c)}
                                className={`h-7 w-7 rounded-full transition-all ${
                                  updateColor === c
                                    ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2231]"
                                    : "hover:scale-110"
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={updateLoading || !updateName.trim()}
                        >
                          <RefreshCcw
                            size={14}
                            className={updateLoading ? "animate-spin" : ""}
                          />
                          {updateLoading ? "Yangilanmoqda..." : "Yangilash"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Body — bo'sh (cells logic kerak bo'lsa qo'shiladi) */}
            <div className="scrollbar-hide flex-1 overflow-y-auto bg-[#0f2942]" />
          </div>
        ))}

        {/* ── Add column panel ─────────────────────────────────────────── */}
        <div className="flex h-full w-72 shrink-0 flex-col border-r border-[#1a3a52] bg-[#0a1929] p-4">
          {showAddForm ? (
            <div className="rounded-xl border border-[#1a3a52] bg-[#0f2942] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Yangi status
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addColumn()}
                placeholder="Nom kiriting..."
                className="mb-3 w-full rounded-lg border border-[#2a4a62] bg-[#1a3a52] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                autoFocus
              />

              <div className="mb-4">
                <p className="mb-2 text-xs text-gray-400">Rang</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`h-6 w-6 rounded-full transition-all ${
                        newColor === c
                          ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2942]"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Rang preview */}
              <div
                className="mb-3 h-1.5 w-full rounded-full"
                style={{ background: newColor }}
              />

              <button
                onClick={addColumn}
                disabled={!newName.trim() || addLoading}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addLoading ? "Qo'shilmoqda..." : "Qo'shish"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAddForm(true);
                setNewName("");
                setNewColor("#3b82f6");
              }}
              className="flex items-center gap-2 rounded-xl border border-dashed border-[#2a4a62] px-4 py-3 text-sm text-gray-400 transition-colors hover:border-blue-500/50 hover:bg-[#0f2942] hover:text-white"
            >
              <Plus size={16} />
              Yangi status qo'shish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
