import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../utils/api";
import { LoadingSpinner } from "../components/Loading";

export const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [templatesByShopId, setTemplatesByShopId] = useState({});
  const [templateLoadingByShopId, setTemplateLoadingByShopId] = useState({});
  const [templateErrorByShopId, setTemplateErrorByShopId] = useState({});
  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeToMinutes = (timeValue) => {
    if (!timeValue) return null;
    const [hours, minutes] = timeValue.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleString();
  };

  const formatTemplateDays = (days = []) => {
    if (!Array.isArray(days) || days.length === 0) return "-";
    return days.join(", ");
  };

  const formatTemplateTime = (timeValue) => (timeValue ? timeValue : "-");

  const formatSlotInterval = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return "-";
    return `${parsed} min`;
  };

  const openTemplateEditor = async ({
    title,
    confirmText,
    initialDays = [],
    initialStartTime = "",
    initialEndTime = "",
    initialInterval = 30,
  }) => {
    const htmlContent = `
      <div class="text-left space-y-4">
        <div>
          <p class="text-xs font-semibold uppercase text-slate-500">Working Days</p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            ${weekDays
              .map(
                (day) => `
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="template-day-${day}" ${initialDays.includes(day) ? "checked" : ""} />
                  <span>${day}</span>
                </label>
              `
              )
              .join("")}
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="text-sm font-medium text-slate-700">
            Start Time
            <input id="template-start-time" type="time" value="${initialStartTime}" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label class="text-sm font-medium text-slate-700">
            Close Time
            <input id="template-end-time" type="time" value="${initialEndTime}" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <label class="text-sm font-medium text-slate-700">
          Slot Interval (minutes)
          <input id="template-interval" type="number" min="5" step="5" value="${initialInterval}" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
    `;

    const result = await Swal.fire({
      title,
      html: htmlContent,
      showCancelButton: true,
      confirmButtonText: confirmText,
      confirmButtonColor: "#2563EB",
      width: 600,
      preConfirm: () => {
        const updatedDays = weekDays.filter(
          (day) => document.getElementById(`template-day-${day}`)?.checked
        );
        const updatedStart = document.getElementById("template-start-time")?.value;
        const updatedEnd = document.getElementById("template-end-time")?.value;
        const updatedInterval = Number(document.getElementById("template-interval")?.value);

        if (!updatedDays.length) {
          Swal.showValidationMessage("Select at least one working day.");
          return null;
        }

        if (!updatedStart || !updatedEnd) {
          Swal.showValidationMessage("Start and close time are required.");
          return null;
        }

        const startMinutes = timeToMinutes(updatedStart);
        const endMinutes = timeToMinutes(updatedEnd);
        if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
          Swal.showValidationMessage("Start time must be before close time.");
          return null;
        }

        if (!Number.isFinite(updatedInterval) || updatedInterval <= 0) {
          Swal.showValidationMessage("Slot interval must be a positive number.");
          return null;
        }

        return {
          workingDays: updatedDays,
          startTime: updatedStart,
          endTime: updatedEnd,
          slotInterval: updatedInterval,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return null;
    return result.value;
  };

  const loadTemplatesForShops = async (shopList) => {
    const shopIds = (shopList || []).map((shop) => shop?._id).filter(Boolean);
    if (!shopIds.length) return;

    setTemplateLoadingByShopId((prev) => {
      const next = { ...prev };
      shopIds.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    const results = await Promise.all(
      shopIds.map(async (shopId) => {
        try {
          const response = await api.get(`/time/template/${shopId}`);
          if (response?.data?.success) {
            return { shopId, data: response.data.data, error: "" };
          }
          return {
            shopId,
            data: null,
            error: response?.data?.message || "No template found",
          };
        } catch (fetchError) {
          return {
            shopId,
            data: null,
            error:
              fetchError?.response?.data?.message ||
              fetchError?.message ||
              "Failed to load template",
          };
        }
      })
    );

    setTemplatesByShopId((prev) => {
      const next = { ...prev };
      results.forEach(({ shopId, data }) => {
        next[shopId] = data;
      });
      return next;
    });

    setTemplateErrorByShopId((prev) => {
      const next = { ...prev };
      results.forEach(({ shopId, error: templateError }) => {
        if (templateError) {
          next[shopId] = templateError;
        } else {
          delete next[shopId];
        }
      });
      return next;
    });

    setTemplateLoadingByShopId((prev) => {
      const next = { ...prev };
      shopIds.forEach((id) => {
        next[id] = false;
      });
      return next;
    });
  };

  const getAllShopsData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/shops");
      const shopList = Array.isArray(response.data) ? response.data : [];
      setShops(shopList);
      loadTemplatesForShops(shopList);
    } catch (fetchError) {
      console.log("Error fetching shops:", fetchError);
      setShops([]);
      setError("Failed to fetch shops data");
      Swal.fire({
        title: "Error",
        text: "Failed to fetch shops data",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateUpdate = async (shop) => {
    const template = templatesByShopId[shop?._id];

    if (!template?._id) {
      Swal.fire({
        title: "Template Missing",
        text: "No template found for this shop. Please create one before updating.",
        icon: "warning",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    const selectedDays = Array.isArray(template.workingDays) ? template.workingDays : [];
    const startTimeValue = template.startTime || "";
    const endTimeValue = template.endTime || "";
    const intervalValue = Number.isFinite(Number(template.slotInterval)) ? template.slotInterval : 30;

    const updatedValues = await openTemplateEditor({
      title: "Update Shop Template",
      confirmText: "Save Template",
      initialDays: selectedDays,
      initialStartTime: startTimeValue,
      initialEndTime: endTimeValue,
      initialInterval: intervalValue,
    });

    if (!updatedValues) return;

    try {
      const updateResponse = await api.put(`/time/template/${template._id}`, {
        workingDays: updatedValues.workingDays,
        startTime: updatedValues.startTime,
        endTime: updatedValues.endTime,
        slotInterval: updatedValues.slotInterval,
      });

      if (!updateResponse?.data?.success) {
        throw new Error(updateResponse?.data?.message || "Failed to update template");
      }

      const updatedTemplate = updateResponse.data.data;
      setTemplatesByShopId((prev) => ({
        ...prev,
        [shop._id]: updatedTemplate,
      }));

      Swal.fire({
        title: "Template Updated",
        text: updateResponse.data.message || "Template updated successfully.",
        icon: "success",
        confirmButtonColor: "#10B981",
      });
    } catch (updateError) {
      Swal.fire({
        title: "Update Failed",
        text:
          updateError?.response?.data?.message ||
          updateError?.message ||
          "Unable to update template.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleTemplateCreate = async (shop) => {
    if (!shop?._id || !shop?.name || !shop?.email || !shop?.phone) {
      Swal.fire({
        title: "Missing Shop Details",
        text: "Shop name, email, and phone are required to create a template.",
        icon: "warning",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    const createdValues = await openTemplateEditor({
      title: "Create Shop Template",
      confirmText: "Create Template",
      initialDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      initialStartTime: "",
      initialEndTime: "",
      initialInterval: 30,
    });

    if (!createdValues) return;

    try {
      const response = await api.post("/time/template/create", {
        shop_owner_id: shop._id,
        name: shop.name,
        email: shop.email,
        phone: shop.phone,
        workingDays: createdValues.workingDays,
        startTime: createdValues.startTime,
        endTime: createdValues.endTime,
        slotInterval: createdValues.slotInterval,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || "Failed to create template");
      }

      const createdTemplate = response.data.data;
      setTemplatesByShopId((prev) => ({
        ...prev,
        [shop._id]: createdTemplate,
      }));

      setTemplateErrorByShopId((prev) => {
        const next = { ...prev };
        delete next[shop._id];
        return next;
      });

      Swal.fire({
        title: "Template Created",
        text: response.data.message || "Template created successfully.",
        icon: "success",
        confirmButtonColor: "#10B981",
      });
    } catch (createError) {
      Swal.fire({
        title: "Creation Failed",
        text:
          createError?.response?.data?.error ||
          createError?.message ||
          "Unable to create template.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const deleteShop = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      const response = await api.delete(`/admin/shops/delete/${id}`);

      if (response?.status === 200) {
        setShops((prev) => prev.filter((shop) => shop._id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Shop has been deleted.",
          icon: "success",
        });
      } else {
        throw new Error(response.data?.message || "Failed to delete shop");
      }
    } catch (deleteError) {
      console.log("Delete shop error:", deleteError);
      Swal.fire({
        title: "Error",
        text: deleteError.response?.data?.message || "Failed to delete shop",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    getAllShopsData();
  }, []);

  const normalizedSearchText = searchText.trim().toLowerCase();

  const getAddress = (shop) =>
    [shop.street, shop.city, shop.district, shop.state, shop.pin].filter(Boolean).join(", ");

  const filteredShops = shops.filter((shop) => {
    if (!normalizedSearchText) return true;

    const services = Array.isArray(shop.services)
      ? shop.services.map((service) => service.service).join(", ")
      : "";

    const searchableData = {
      shopname: String(shop.shopname || "").toLowerCase(),
      owner: String(shop.name || "").toLowerCase(),
      email: String(shop.email || "").toLowerCase(),
      phone: String(shop.phone || "").toLowerCase(),
      city: String(shop.city || "").toLowerCase(),
      state: String(shop.state || "").toLowerCase(),
      status: String(shop.status || "").toLowerCase(),
      services: String(services || "").toLowerCase(),
      address: String(getAddress(shop) || "").toLowerCase(),
      createdAt: String(formatDateTime(shop.createdAt) || "").toLowerCase(),
    };

    if (searchBy === "all") {
      return Object.values(searchableData).some((value) => value.includes(normalizedSearchText));
    }

    return searchableData[searchBy]?.includes(normalizedSearchText);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Approved Shops Management</h1>
              <p className="text-slate-600 text-sm mt-1">Manage all approved shops and their details.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Showing: {filteredShops.length}{normalizedSearchText ? ` / ${shops.length}` : ""}
              </span>
              <button
                onClick={getAllShopsData}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3">
            <select
              value={searchBy}
              onChange={(event) => setSearchBy(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Fields</option>
              <option value="shopname">Shop Name</option>
              <option value="owner">Owner</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="city">City</option>
              <option value="state">State</option>
              <option value="status">Status</option>
              <option value="services">Services</option>
              <option value="address">Address</option>
              <option value="createdAt">Created At</option>
            </select>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={`Search by ${searchBy === "all" ? "any field" : searchBy}...`}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() => setSearchText("")}
              disabled={!searchText}
              className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-red-700">Error Loading Shops</h2>
            <p className="text-slate-600 mt-2">{error}</p>
            <button
              onClick={getAllShopsData}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
            <h3 className="text-xl font-semibold text-slate-700">No approved shops found</h3>
            <p className="text-slate-500 mt-2">There are no approved shops to display right now.</p>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
            <h3 className="text-xl font-semibold text-slate-700">No matching shops</h3>
            <p className="text-slate-500 mt-2">Try a different search field or keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredShops.map((shop, index) => (
              <article
                key={shop._id || index}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h2 className="text-lg font-bold text-slate-900 break-words">{shop.shopname || "-"}</h2>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Approved
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Owner</p>
                        <p className="text-sm text-slate-800 break-words mt-1">{shop.name || "-"}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                        <p className="text-sm text-slate-800 break-all mt-1">{shop.email || "-"}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                        <p className="text-sm text-slate-800 break-all mt-1">{shop.phone || "-"}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                        <p className="text-sm text-slate-800 break-words mt-1">
                          {getAddress(shop) || "-"}
                        </p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Services</p>
                        <p className="text-sm text-slate-800 mt-1">{Array.isArray(shop.services) ? shop.services.length : 0}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                        <p className="text-sm text-slate-800 mt-1 capitalize">{shop.status || "-"}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Created At</p>
                        <p className="text-sm text-slate-800 mt-1">{formatDateTime(shop.createdAt)}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Updated At</p>
                        <p className="text-sm text-slate-800 mt-1">{formatDateTime(shop.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Shop Template</p>
                          {templateLoadingByShopId[shop._id] ? (
                            <p className="text-sm text-slate-600 mt-1">Loading template...</p>
                          ) : templateErrorByShopId[shop._id] ? (
                            <p className="text-sm text-amber-700 mt-1">{templateErrorByShopId[shop._id]}</p>
                          ) : templatesByShopId[shop._id] ? (
                            <div className="mt-2 space-y-1 text-sm text-slate-700">
                              <p>
                                <span className="font-semibold">Working Days:</span>{" "}
                                {formatTemplateDays(templatesByShopId[shop._id]?.workingDays)}
                              </p>
                              <p>
                                <span className="font-semibold">Hours:</span>{" "}
                                {formatTemplateTime(templatesByShopId[shop._id]?.startTime)} -{" "}
                                {formatTemplateTime(templatesByShopId[shop._id]?.endTime)}
                              </p>
                              <p>
                                <span className="font-semibold">Slot Interval:</span>{" "}
                                {formatSlotInterval(templatesByShopId[shop._id]?.slotInterval)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600 mt-1">No template found.</p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            templatesByShopId[shop._id]
                              ? handleTemplateUpdate(shop)
                              : handleTemplateCreate(shop)
                          }
                          disabled={templateLoadingByShopId[shop._id]}
                          className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {templatesByShopId[shop._id] ? "Update Template" : "Create Template"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    <Link
                      to={`/admin/shops/${shop._id}/edit`}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteShop(shop._id)}
                      className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
