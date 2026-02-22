import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { api } from "../utils/api";

export const AdminContacts = () => {
  const [contactData, setContactData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [searchText, setSearchText] = useState("");

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleString();
  };

  const getUserTypeBadgeClass = (usertype) => {
    if (usertype === "admin") return "bg-purple-100 text-purple-800";
    if (usertype === "shopOwner") return "bg-blue-100 text-blue-800";
    if (usertype === "customer") return "bg-emerald-100 text-emerald-800";
    return "bg-gray-100 text-gray-800";
  };

  const getContactsData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/contacts");
      setContactData(Array.isArray(response.data) ? response.data : []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || "Failed to fetch contacts data");
      setContactData([]);
      toast.error("Failed to load contacts data");
    } finally {
      setLoading(false);
    }
  };

  const deleteContactById = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const response = await api.delete(`/admin/contacts/delete/${id}`);

      if (response.status === 200) {
        setContactData((prev) => prev.filter((contact) => contact._id !== id));
        toast.success("Contact deleted successfully");

        Swal.fire({
          title: "Deleted!",
          text: "Contact has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response.data?.message || "Error in deletion");
      }
    } catch (deleteError) {
      toast.error(deleteError.response?.data?.message || "Failed to delete contact");
      Swal.fire({
        title: "Error!",
        text: deleteError.response?.data?.message || "Failed to delete contact",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    getContactsData();
  }, []);

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredContacts = contactData.filter((contact) => {
    if (!normalizedSearchText) return true;

    const searchableData = {
      name: String(contact.name || "").toLowerCase(),
      email: String(contact.email || "").toLowerCase(),
      usertype: String(contact.usertype || "guest").toLowerCase(),
      message: String(contact.message || "").toLowerCase(),
      id: String(contact._id || "").toLowerCase(),
      createdAt: String(formatDateTime(contact.createdAt) || "").toLowerCase(),
    };

    if (searchBy === "all") {
      return Object.values(searchableData).some((value) => value.includes(normalizedSearchText));
    }

    return searchableData[searchBy]?.includes(normalizedSearchText);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Contacts Management</h1>
              <p className="text-slate-600 text-sm mt-1">
                Review and manage user messages sent from the contact page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Showing: {filteredContacts.length}{normalizedSearchText ? ` / ${contactData.length}` : ""}
              </span>
              <button
                onClick={getContactsData}
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
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="usertype">User Type</option>
              <option value="message">Message</option>
              <option value="id">Contact ID</option>
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
            <h2 className="text-xl font-bold text-red-700">Error Loading Contacts</h2>
            <p className="text-slate-600 mt-2">{error}</p>
            <button
              onClick={getContactsData}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : contactData.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
            <h3 className="text-xl font-semibold text-slate-700">No contacts found</h3>
            <p className="text-slate-500 mt-2">There are no contact messages to display right now.</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
            <h3 className="text-xl font-semibold text-slate-700">No matching contacts</h3>
            <p className="text-slate-500 mt-2">Try a different search field or keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredContacts.map((contact, index) => (
              <article
                key={contact._id || index}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h2 className="text-lg font-bold text-slate-900 break-words">{contact.name}</h2>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getUserTypeBadgeClass(
                          contact.usertype
                        )}`}
                      >
                        {contact.usertype || "guest"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-blue-700 break-all mt-1 inline-block hover:underline"
                        >
                          {contact.email || "-"}
                        </a>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Created At</p>
                        <p className="text-sm text-slate-800 mt-1">{formatDateTime(contact.createdAt)}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Contact ID</p>
                        <p className="text-xs text-slate-700 break-all mt-1">{contact._id}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Message</p>
                      <p className="text-sm text-slate-800 break-words whitespace-pre-wrap mt-1">
                        {contact.message || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => deleteContactById(contact._id)}
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
