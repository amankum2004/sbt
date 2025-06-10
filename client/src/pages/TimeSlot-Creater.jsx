import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useLogin } from "../components/LoginContext";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const TemplateForm = () => {
  const { user } = useLogin();

  const [form, setForm] = useState({
    shop_owner_id: "",
    name: "",
    email: "",
    phone: "",
    workingDays: [],
    startTime: "09:00",
    endTime: "17:00",
    slotInterval: 30,
  });

  useEffect(() => {
    if (user) {
      const fetchShopOwnerId = async () => {
        try {
          const res = await api.get(`/shop/by-email/${user.email}`);
          const shopId = res.data?._id;

          setForm((prev) => ({
            ...prev,
            shop_owner_id: shopId || "",
            name: user.name || "",
            email: user.email || "",
            phone: res.data?.phone || "",
          }));
        } catch (err) {
          console.error("Error fetching shop data:", err);
        }
      };

      fetchShopOwnerId();
    }
  }, [user]);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("time/template/create", form);
      alert("Template created!");
    } catch (err) {
      console.error("Template creation failed:", err);
      alert("Error creating template.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded shadow space-y-4 max-w-xl mx-auto"
    >
      <h2 className="text-xl font-semibold">Define Your Slot Template</h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border px-2 py-1 rounded"
            readOnly
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border px-2 py-1 rounded"
            readOnly
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border px-2 py-1 rounded"
            readOnly
            required
          />
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <label
            key={day}
            className={`border px-3 py-1 rounded cursor-pointer ${
              form.workingDays.includes(day) ? "bg-blue-500 text-white" : ""
            }`}
          >
            <input type="checkbox" hidden onChange={() => toggleDay(day)} />
            {day}
          </label>
        ))}
      </div>

      {/* Time Setup */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Start Time</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>End Time</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="w-full border px-2 py-1"
          />
        </div>
      </div>

      <div>
        <label>Slot Interval (in minutes)</label>
        <input
          type="number"
          value={form.slotInterval}
          onChange={(e) =>
            setForm({ ...form, slotInterval: +e.target.value })
          }
          className="w-full border px-2 py-1"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Template
      </button>
    </form>
  );
};
