import { useEffect, useState } from "react";
import {
  Phone,
  MapPin,
  Tag,
  MessageSquare,
  ChevronLeft,
  MoreVertical,
  Search,
  HandCoins,
  SendHorizonal,
  Calendar,
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

const leadDetails = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [dealData, setDealData] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("asosiy");
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [leadSource, setLeadSource] = useState([]);

  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");

  // Projectlarni barchasini olish
  useEffect(() => {
    const fetchLeadSource = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_VITE_API_KEY_PROHOME}/lead-source/${projectId}`,
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

  //

  // Leadni toliq malumotlarini olish
  useEffect(() => {
    fetch(`${import.meta.env.VITE_VITE_API_KEY_PROHOME}/leeds/${leadId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setDealData(data);
      });
  }, []);

  //

  // Descriptionlarni olib kelish
  const getDescriptions = () => {
    fetch(
      `${import.meta.env.VITE_VITE_API_KEY_PROHOME}/Description/lead/${leadId}?projectId=${projectId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  };
  function getDesc() {
    getDescriptions();
  }
  useEffect(() => {
    getDesc();
  }, []);

  //

  // Description yuborish (POST)
  const handlePostDesc = async (data) => {
    const dataDesc = {
      projectId: Number(projectId),
      leadsId: +leadId,
      text: data,
    };

    fetch(`${import.meta.env.VITE_VITE_API_KEY_PROHOME}/Description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataDesc),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        getDescriptions();
      });
    setNoteText("");
  };

  //

  // Lead malumotlarini PATCH qilish
  const handleChange = (event) => {
    const { name, value } = event.target;

    setDealData({
      ...dealData,
      [name]: value,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    const submitData = {
      firstName: dealData.firstName,
      lastName: dealData.lastName,
      phone: dealData.phone,
      extraPhone: dealData.extraPhone,
      adress: dealData.adress,
      budjet: Number(dealData.budjet),
      leadSourceId: Number(dealData.leadSourceId),
      projectId: Number(projectId),
      tag: dealData.tag,
      birthDate: new Date(dealData.birthDate).toISOString().split("T")[0],
    };

    // ✅ toast.promise bilan
    toast.promise(
      fetch(`${import.meta.env.VITE_VITE_API_KEY_PROHOME}/leeds/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          // setActiveTab("asosiy");
        }),
      {
        loading: "O'zgartirilmoqda...",
        success: "Ma'lumotlar muvaffaqiyatli yangilandi ✅",
        error: "Yangilashda xatolik yuz berdi ❌",
      },
    );
  };

  //

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  //

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  //

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  //

  if (loading) {
    return (
      <div className="flex h-[94vh] bg-[#0c1e2e] text-gray-200">
        {/* Left Sidebar Skeleton */}
        <div className="flex w-96 flex-col border-r border-[#1a3549] bg-[#0f2438]">
          {/* Header */}
          <div className="border-b border-[#1a3549] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded bg-[#1a3549]" />
                <Skeleton className="h-6 w-24 rounded bg-[#1a3549]" />
              </div>
              <Skeleton className="h-8 w-8 rounded bg-[#1a3549]" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full bg-[#1a4560]" />
          </div>

          {/* User Info */}
          <div className="border-b border-[#1a3549] p-4">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full bg-[#1a3549]" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-32 rounded bg-[#1a3549]" />
                <Skeleton className="h-4 w-20 rounded bg-[#1a3549]" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#1a3549]">
            <div className="flex">
              <Skeleton className="h-10 flex-1 rounded-none bg-[#1a3549]/30" />
              <Skeleton className="h-10 flex-1 rounded-none bg-[#1a3549]/20" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 p-4">
            {/* Project */}
            <div>
              <Skeleton className="mb-2 h-3 w-16 rounded bg-[#1a3549]/50" />
              <Skeleton className="h-5 w-8 rounded bg-[#1a3549]" />
            </div>

            {/* Mablag' */}
            <div>
              <Skeleton className="mb-2 h-3 w-20 rounded bg-[#1a3549]/50" />
              <Skeleton className="h-5 w-36 rounded bg-[#1a3549]" />
            </div>

            {/* TANLAGAN_TARIFI */}
            <div>
              <Skeleton className="mb-2 h-3 w-32 rounded bg-[#1a3549]/50" />
              <Skeleton className="h-4 w-12 rounded bg-[#1a3549]" />
            </div>

            {/* TRANID */}
            <div>
              <Skeleton className="mb-2 h-3 w-16 rounded bg-[#1a3549]/50" />
              <Skeleton className="h-4 w-12 rounded bg-[#1a3549]" />
            </div>

            {/* Contact Info */}
            <div className="space-y-3 border-t border-[#1a3549] pt-4">
              <div>
                <Skeleton className="mb-1 h-3 w-20 rounded bg-[#1a3549]/50" />
                <Skeleton className="h-4 w-32 rounded bg-[#1a3549]" />
              </div>
              <div>
                <Skeleton className="mb-1 h-3 w-28 rounded bg-[#1a3549]/50" />
                <Skeleton className="h-4 w-32 rounded bg-[#1a3549]" />
              </div>
              <div>
                <Skeleton className="mb-1 h-3 w-16 rounded bg-[#1a3549]/50" />
                <Skeleton className="h-4 w-40 rounded bg-[#1a3549]" />
              </div>
            </div>

            {/* Tag */}
            <div className="border-t border-[#1a3549] pt-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded bg-[#1a3549]" />
                <Skeleton className="h-5 w-48 rounded bg-[#1a3549]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div className="flex flex-1 flex-col">
          {/* Search Header */}
          <div className="border-b border-[#1a3549] bg-[#0f2438] p-4">
            <Skeleton className="h-10 w-full max-w-md rounded bg-[#1a3549]" />
          </div>

          {/* Events Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex justify-center">
              <Skeleton className="h-7 w-32 rounded-full bg-[#1a3549]" />
            </div>

            <div className="mx-auto max-w-3xl space-y-4">
              <Skeleton className="mb-6 h-4 w-48 rounded bg-[#1a3549]" />

              {/* Event Cards */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#1a3549] bg-[#0f2438] p-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 shrink-0 rounded bg-blue-600/30" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 rounded bg-[#1a3549]" />
                      <Skeleton className="h-4 w-full rounded bg-[#1a3549]" />
                      <Skeleton className="h-4 w-3/4 rounded bg-[#1a3549]" />
                      <div className="flex justify-end">
                        <Skeleton className="h-3 w-32 rounded bg-[#1a3549]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="border-t border-[#1a3549] bg-[#0f2438] p-4">
            <div className="mx-auto max-w-3xl">
              <Skeleton className="mb-2 h-4 w-40 rounded bg-[#1a3549]" />
              <div className="flex items-end gap-3">
                <Skeleton className="h-20 flex-1 rounded-lg bg-[#1a3549]" />
                <Skeleton className="h-12 w-28 rounded-lg bg-blue-600/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge - Fixed */}
        <div className="fixed top-20 right-4">
          <Skeleton className="h-9 w-40 rounded-full bg-[#1a3549]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0c1e2e] text-gray-200">
      <div className="flex w-96 flex-col border-r border-[#1a3549] bg-[#0f2438]">
        <div className="border-b border-[#1a3549] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="rounded p-2 hover:bg-[#1a3549]"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-semibold">Bitim #{dealData.id}</h1>
            </div>
            <button className="rounded p-2 hover:bg-[#1a3549]">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="inline-block">
            <span className="rounded bg-[#1a4560] px-3 py-1 text-sm text-blue-300">
              {dealData.tag}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-[#1a3549] p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold"></div>
              <div>
                <h2 className="font-semibold text-white">
                  {dealData.firstName} {dealData.lastName}
                </h2>
                <p className="text-sm text-gray-400">#{dealData.id} mijoz</p>
              </div>
            </div>
          </div>

          <div className="border-b border-[#1a3549]">
            <div className="flex">
              {["Asosiy", "Tahrirlash"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {activeTab === "asosiy" ? (
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500 uppercase">
                  Project
                </label>
                {/* Project name qoyish kerak */}
                <p className="font-medium text-white">
                  {dealData?.project?.name}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500 uppercase">
                  Mablag'
                </label>
                <p className="flex items-center gap-2 font-medium text-white">
                  <HandCoins size={16} className="text-yellow-400" />
                  {formatCurrency(dealData.budjet)}
                </p>
              </div>
              {/* TANLAGAN_TARIFI */}
              <div>
                <label className="mb-1 block text-xs text-gray-500 uppercase">
                  Operator
                </label>
                <p className="text-white">{dealData?.assignedUser?.fullName}</p>
              </div>
              {/* TRANID */}
              <div>
                <label className="mb-1 block text-xs text-gray-500 uppercase">
                  Manbaa
                </label>
                <p className="text-white">{dealData?.leadSource?.name}</p>
              </div>
              <div className="border-t border-[#1a3549] pt-4">
                <div className="space-y-2">
                  {/* Phone */}
                  <div>
                    <label className="text-xs text-gray-500">Tel raqam:</label>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <a
                        href={`tel:${dealData.phone}`}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {dealData.phone}
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Qo'shimcha raqam:
                    </label>
                    <p className="flex items-center gap-2 text-sm text-white">
                      <Phone size={14} className="text-gray-400" />
                      <a
                        href={`tel:${dealData.extraPhone}`}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {dealData.extraPhone}
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Tug'ulgan sanasi:
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-sm text-white">
                        {formatDate(dealData.birthDate)}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs text-gray-500">Manzil:</label>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <p className="text-sm text-white">{dealData.adress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form
              className="w-full max-w-sm p-5 text-white"
              onSubmit={handleSubmit}
            >
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="form-name">Ism</FieldLabel>
                    <Input
                      id="form-name"
                      type="text"
                      name="firstName"
                      value={dealData.firstName}
                      onChange={handleChange}
                      placeholder="Ism kiriting!"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="form-email">Familiya</FieldLabel>
                    <Input
                      id="form-email"
                      type="text"
                      name="lastName"
                      value={dealData.lastName}
                      onChange={handleChange}
                      placeholder="Familiya kiriting!s"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="form-birthDate">
                    Tug'ilgan sana:
                  </FieldLabel>
                  <Input
                    id="form-birthDate"
                    type="date"
                    name="birthDate"
                    value={dealData.birthDate ?? ""}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="form-phone">Telefon raqam</FieldLabel>
                    <Input
                      id="form-phone"
                      type="tel"
                      name="phone"
                      value={dealData.phone}
                      onChange={handleChange}
                      placeholder="+998 ** *** ** **"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="form-extraphone">
                      Qo'shimcha raqam
                    </FieldLabel>
                    <Input
                      id="form-extraphone"
                      type="tel"
                      name="extraPhone"
                      value={dealData.extraPhone}
                      onChange={handleChange}
                      placeholder="+998 ** *** ** **"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="form-address">Address</FieldLabel>
                  <Input
                    id="form-address"
                    type="text"
                    name="adress"
                    value={dealData.adress}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="form-budjet">Budjet</FieldLabel>
                    <Input
                      id="form-budjet"
                      type="number"
                      name="budjet"
                      value={dealData.budjet}
                      onChange={handleChange}
                      placeholder="*** ***   so`m"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="form-source">Manbaa</FieldLabel>

                    <Select
                      value={
                        dealData.leadSourceId
                          ? dealData.leadSourceId.toString()
                          : ""
                      }
                      onValueChange={(value) => {
                        setDealData({
                          ...dealData,
                          leadSourceId: parseInt(value),
                        });
                      }}
                    >
                      <SelectTrigger id="form-source">
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>

                      <SelectContent className="mt-10">
                        {leadSource.map((data) => (
                          <SelectItem key={data.id} value={data.id.toString()}>
                            {data.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="form-tag">Teg:</FieldLabel>
                  <Input
                    id="form-tag"
                    type="text"
                    name="tag"
                    value={dealData.tag}
                    onChange={handleChange}
                    placeholder="Teg yozing qirish uchun oson bo`ladi..."
                  />
                </Field>

                <Field orientation="horizontal">
                  <Button
                    type="button"
                    variant="outline"
                    className={
                      "text-[#0f2438] hover:bg-[#0f2438] hover:text-white"
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className={
                      "border bg-[#0f2438] hover:bg-[#006400] hover:text-white"
                    }
                  >
                    Submit
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-[#1a3549] bg-[#0f2438] p-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-md flex-1">
              <input
                type="text"
                placeholder="Поиск и фильтр"
                className="w-full rounded border border-[#1a3549] bg-[#0c1e2e] px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                <Search />
              </div>
            </div>

            <div>
              <div
                className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
                style={{ backgroundColor: dealData?.status?.color }}
              >
                {dealData?.status?.name}
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[72vh] flex-1 overflow-y-auto p-6">
          <div className="mb-6 p-6">
            <div className="mb-6 text-center">
              <span className="rounded-full border border-[#1a3549] bg-[#0f2438] px-4 py-1 text-sm text-gray-400">
                Декабрь, 2025
              </span>
            </div>

            <div className="mx-auto max-w-3xl space-y-6">
              <div className="mb-8">
                <div className="mb-2 text-sm text-gray-400">
                  {formatDateTime(dealData.createdAt)} • Создание: 3 события
                </div>
              </div>

              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-[#1a3549] bg-[#0f2438] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600">
                      {event.type === "message" ? (
                        <MessageSquare size={16} />
                      ) : event.type === "status_change" ? (
                        <Tag size={16} />
                      ) : (
                        <Tag size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-400">
                            {event.user.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-300">
                        {event.text}
                      </p>

                      <span className="flex justify-end text-sm font-medium text-white">
                        {formatDateTime(event.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Date Separator */}
              <div className="my-8 text-center">
                <span className="rounded-full border border-[#1a3549] bg-[#0f2438] px-4 py-1 text-sm text-gray-400">
                  27.01.2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note Input */}
        <div className="border-t border-[#1a3549] bg-[#0f2438] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
              {/* <Select>
                <SelectValue />

                <SelectContent>
                  <SelectItem>Task</SelectItem>
                </SelectContent>
              </Select> */}
              <MessageSquare size={16} />
              <span>Привлечение:</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex min-h-15 flex-1 items-center justify-center rounded-lg border border-[#1a3549] bg-[#0c1e2e] p-3 focus-within:border-blue-500">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Напишите комментарий..."
                  className="w-full resize-none bg-transparent text-sm focus:outline-none"
                  rows="2"
                />
              </div>
              <button
                onClick={() => handlePostDesc(noteText)}
                className="item flex gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium transition-colors hover:bg-blue-700"
              >
                Yuborish
                <SendHorizonal size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default leadDetails;
