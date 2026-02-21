import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

export default function leadSource() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [leadSource, setLeadSource] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // ✅ File uchun
  const [imagePreview, setImagePreview] = useState(null); // ✅ Preview uchun
  const [newLeadSource, setNewLeadSource] = useState({
    name: "",
    projectId: +projectId,
    isActive: false,
  });

  // ✅ Image tanlash
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Preview uchun
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ? Create Lead Source
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      // ✅ FormData yaratish (file yuborish uchun)
      const formData = new FormData();
      formData.append("name", newLeadSource.name);
      formData.append("projectId", newLeadSource.projectId);
      formData.append("isActive", newLeadSource.isActive);

      if (selectedImage) {
        formData.append("icon", selectedImage); // Backend'da "icon" field nomi
      }

      const res = await fetch(import.meta.env.VITE_API_KEY_LEADSOURCE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ "Content-Type": "application/json" ni OLIB TASHLASH kerak!
          // FormData o'zi Content-Type ni set qiladi
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Muvaffaqiyatli yaratildi:", data);

        // Yangi elementni listga qo'shish
        setLeadSource([...leadSource, data]);

        // Formani tozalash
        setNewLeadSource({
          name: "",
          projectId: +projectId,
          isActive: false,
        });
        setSelectedImage(null);
        setImagePreview(null);

        // Dialogni yopish
        setDialogOpen(false);
      } else {
        const errorData = await res.json();
        console.error("Xatolik:", errorData);
      }
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }
  };

  //* Get Lead Source
  useEffect(() => {
    const fetchLeadSource = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY_LEADSOURCE}/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Xato ${res.status} ,${res.statusText}`);
        }

        const data = await res.json();
        setLeadSource(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchLeadSource();
  }, []);

  // ? Update Lead Source
  const handleEdit = (item) => {
    console.log("Tahrirlash:", item);
  };

  //! Delete Lead Source
  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY_LEADSOURCE}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        setLeadSource(leadSource.filter((item) => item.id !== id));
        console.log("O'chirildi");
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f2231] text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-indigo-300">
            Lead Manbalari
          </h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl bg-indigo-600 p-2 hover:bg-indigo-700">
                <Plus /> Yangi manba qo'shish
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#101a2a] text-white">
              <DialogHeader>
                <DialogTitle>
                  Malumot qoshish uchun bosh joylarni to`ldiring!
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="name">Nom bering!</FieldLabel>
                  <Input
                    id="name"
                    value={newLeadSource.name}
                    onChange={(e) =>
                      setNewLeadSource({
                        ...newLeadSource,
                        name: e.target.value,
                      })
                    }
                    placeholder="Masalan: Instagram"
                    required
                  />
                  <FieldDescription>Write your source name</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="picture">Icon rasmi</FieldLabel>
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <FieldDescription>
                    Select an image for the icon
                  </FieldDescription>

                  {/* ✅ Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-lg object-cover ring-2 ring-indigo-500"
                      />
                    </div>
                  )}
                </Field>

                <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 p-4">
                  <Label className="cursor-pointer">
                    Ushbu manbaa aktiv holatidami?
                  </Label>
                  <Switch
                    checked={newLeadSource.isActive}
                    onCheckedChange={(value) =>
                      setNewLeadSource({ ...newLeadSource, isActive: value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="flex-1 text-black"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Yaratish
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-xl border border-indigo-900/40 bg-gray-900/80 shadow-xl backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-indigo-900/50 bg-indigo-950/70 px-6 py-4 text-xs font-medium tracking-wider text-indigo-300/80 uppercase">
            <div className="col-span-4">Manba nomi</div>
            <div className="col-span-2">ID / Loyiha</div>
            <div className="col-span-2">Holat</div>
            <div className="col-span-2">Qo'shilgan</div>
            <div className="col-span-2">Amallar</div>
          </div>

          {leadSource.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center gap-4 border-b border-indigo-900/30 px-6 py-5 transition-colors duration-150 last:border-b-0 hover:bg-indigo-950/40"
            >
              <div className="col-span-4 flex items-center gap-3">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt=""
                    className="h-8 w-8 rounded-md object-cover ring-1 ring-indigo-700/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-800/40 text-sm font-medium text-indigo-300 ring-1 ring-indigo-700/20">
                    {item.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="font-medium text-gray-100">
                  {item.name || "—"}
                </div>
              </div>

              <div className="col-span-2 text-sm text-gray-400">
                #{item.id} · {item.projectId}
              </div>

              <div className="col-span-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    item.isActive
                      ? "border border-emerald-800/40 bg-emerald-900/50 text-emerald-300"
                      : "border border-rose-800/40 bg-rose-900/50 text-rose-300"
                  }`}
                >
                  {item.isActive ? "Faol" : "Faol emas"}
                </span>
              </div>

              <div className="col-span-2 text-sm text-gray-400">
                {new Date(item.createdAt).toLocaleDateString("uz-UZ", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-indigo-400 transition-colors hover:text-indigo-300"
                  title="Tahrirlash"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-rose-400 transition-colors hover:text-rose-300"
                  title="O'chirish"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {leadSource.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">
              Hozircha hech qanday lead manbasi mavjud emas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
