import { useState, useEffect, useRef } from "react";
import { Copy, Check, Camera, ChevronDown, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMAGE_BASE = "https://back.prohome.uz/api/v1/image";
const LANGUAGES = ["Русский", "O'zbek", "English"];

// ─── helpers ────────────────────────────────────────────────────────────────

function getImageUrl(imgUrl) {
  if (!imgUrl) return null;
  if (imgUrl.startsWith("blob:") || imgUrl.startsWith("http")) return imgUrl;
  return `${IMAGE_BASE}/${imgUrl}`;
}

function getToken() {
  const raw = localStorage.getItem("user");
  return raw;
}

async function fetchProfile() {
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function patchProfile(formData) {
  const res = await fetch(`${API_BASE}/user/update-me`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── sub-components ─────────────────────────────────────────────────────────

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="ml-2 text-gray-500 transition-colors hover:text-gray-300"
    >
      {ok ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

function LangSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative w-72">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] transition-colors hover:border-[#3a5570] focus:outline-none"
      >
        {value}
        <ChevronDown
          size={14}
          className={`text-[#7a9ab5] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 w-full overflow-hidden rounded border border-[#253d52] bg-[#1a2e40] shadow-2xl">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => {
                onChange(l);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${l === value ? "text-blue-400" : "text-[#c8dce8]"}`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="mb-0.5 flex min-h-11 items-start">
      <div className="w-40 shrink-0 pt-2.5">
        <span className="text-sm text-[#7a9ab5]">{label}</span>
      </div>
      <div className="flex items-center pt-1.5">{children}</div>
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-72 rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] placeholder-[#3a5570] transition-colors outline-none focus:border-blue-500 disabled:opacity-50"
    />
  );
}

function TTextarea({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-72 resize-none rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] placeholder-[#3a5570] transition-colors outline-none focus:border-blue-500"
    />
  );
}

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`relative h-5 w-9 rounded-full border transition-colors duration-200 ${
        active
          ? "border-blue-500 bg-blue-500"
          : "border-[#3a5570] bg-transparent"
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-200 ${
          active ? "left-4.5 bg-white" : "left-0.5 bg-[#3a5570]"
        }`}
      />
    </button>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    language: "Русский",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    note: "",
    userId: "",
  });

  // ── fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchProfile();

        const user = data?.data || data?.user || data;
        setForm((f) => ({
          ...f,
          fullName: user.fullName || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          note: user.note || "",
          userId: String(user.id || user._id || user.companyId || ""),
        }));

        // Build correct image URL via getImageUrl
        const rawImg = user.img || user.avatar || user.profileImage;
        if (rawImg) setAvatarPreview(getImageUrl(rawImg));
      } catch (err) {
        setError("Профиль юкланмади: " + err.message);
        try {
          const raw = localStorage.getItem("userData");
          if (raw) {
            const { user = {} } = JSON.parse(raw);
            setForm((f) => ({
              ...f,
              email: user.email || "",
              userId: String(user.id || user.companyId || f.userId),
              fullName:
                user.name || user.fullName || user.email?.split("@")[0] || "",
              phone: user.phone || "",
              note: user.note || "",
            }));
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  // ── avatar file pick ───────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file)); // blob: passes through getImageUrl unchanged
  };

  // ── save / PATCH ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      if (avatarFile) fd.append("img", avatarFile);

      const result = await patchProfile(fd);

      // Update avatar preview from server response using getImageUrl
      const updatedImg =
        result?.data?.img || result?.data?.avatar || result?.data?.profileImage;
      if (updatedImg) {
        setAvatarPreview(getImageUrl(updatedImg));
        setAvatarFile(null);
      }

      try {
        const raw = localStorage.getItem("userData");
        const parsed = raw ? JSON.parse(raw) : { user: {} };
        parsed.user = {
          ...parsed.user,
          ...result?.data,
          name: form.fullName,
          email: form.email,
        };
        localStorage.setItem("userData", JSON.stringify(parsed));
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Saqlashda xato: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (form.fullName || form.email || "Z")[0].toUpperCase();

  return (
    <div
      className="mx-auto min-h-screen bg-[#0d1e2e] text-white"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="mx-auto flex max-w-3xl items-center justify-between border-b border-[#162840] bg-[#0d1e2e] px-6 py-3.5">
        <span className="text-[15px] font-medium text-[#c0d8e8]">
          Настройки профиля
        </span>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 rounded border border-[#2a4560] bg-[#1a2e40] px-5 py-1.5 text-sm font-medium text-[#9ab8cc] transition-colors hover:border-[#3a5570] disabled:opacity-50"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saved ? "Сохранено ✓" : saving ? "Сохраняется..." : "Сохранить"}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-3xl px-6 pt-4">
          <div className="rounded border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-3xl p-6">
        {/* Profile Card */}
        <div className="mb-7 rounded-md border border-[#162840] bg-[#0f2030] p-7">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#456070]">
              <Loader2 size={22} className="mr-2 animate-spin" />
              <span className="text-sm">Загрузка профиля...</span>
            </div>
          ) : (
            <div className="flex gap-9">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="relative h-24 w-24">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-4xl font-black text-white"
                      style={{
                        background: "linear-gradient(145deg,#7a3810,#a04a20)",
                      }}
                    >
                      {avatarLetter}
                    </div>
                  )}
                  <label className="absolute right-1 bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#2a4560] bg-[#1a2e40] transition-colors hover:bg-[#243d54]">
                    <Camera size={13} className="text-[#7a9ab5]" />
                    <input
                      type="file"
                      accept="image/jpg,image/png,image/jpeg,image/gif"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1">
                <Row label="ID пользователя">
                  <span className="text-sm text-[#7a9ab5]">{form.userId}</span>
                  <CopyBtn value={form.userId} />
                </Row>
                <Row label="Language / Язык">
                  <LangSelect
                    value={form.language}
                    onChange={set("language")}
                  />
                </Row>
                <Row label="Полное имя">
                  <TInput
                    value={form.fullName}
                    onChange={set("fullName")}
                    placeholder="Введите имя"
                  />
                </Row>
                <Row label="Телефон">
                  <TInput
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+998 xx xxx xx xx"
                  />
                </Row>
                <Row label="Email">
                  <TInput
                    value={form.email}
                    onChange={set("email")}
                    placeholder="email@example.com"
                    type="email"
                  />
                </Row>
                <Row label="Пароль">
                  <TInput
                    value={form.password}
                    onChange={set("password")}
                    placeholder="••••••"
                    type="password"
                  />
                </Row>
                <Row label="Примечание">
                  <TTextarea value={form.note} onChange={set("note")} />
                </Row>
              </div>
            </div>
          )}
        </div>

        {/* Security */}
        {/* <p className="mb-3 text-[15px] font-medium text-[#c0d8e8]">
          Безопасность
        </p>
        <div className="mb-7 rounded-md border border-[#162840] bg-[#0f2030] px-6 py-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-medium text-[#c0d8e8]">
              2-этапная проверка
            </span>
            <Toggle active={twoFactor} onChange={setTwoFactor} />
          </div>
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-[#456070]">
            Добавьте дополнительную защиту для вашего аккаунта amoCRM. Помимо
            пароля, при каждом входе потребуется вводить код из письма,
            отправленного на вашу электронную почту.
          </p>
        </div> */}

        {/* Sessions */}
        {/* <p className="mb-3 text-[15px] font-medium text-[#c0d8e8]">Сеансы</p>
        <div className="rounded-md border border-[#162840] bg-[#0f2030] px-6 py-4">
          <p className="text-[12.5px] leading-relaxed text-[#456070]">
            Список авторизованных устройств. Сеансы завершаются через 3 месяца
            без активности. Если вы заметили что-то подозрительное, рекомендуем
            сменить пароль. После смены пароля вы автоматически выйдите из
            аккаунта на всех устройствах, кроме текущего.
          </p>
        </div> */}
      </div>
    </div>
  );
}
