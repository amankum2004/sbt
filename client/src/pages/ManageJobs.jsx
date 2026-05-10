import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const JOB_TYPES = ["full_time", "part_time", "contract", "internship"];
const JOB_TYPE_LABELS = { full_time: "Full Time", part_time: "Part Time", contract: "Contract", internship: "Internship" };

const APP_STATUS_COLORS = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  reviewed: "text-blue-700 bg-blue-50 border-blue-200",
  shortlisted: "text-emerald-700 bg-emerald-50 border-emerald-200",
  rejected: "text-rose-700 bg-rose-50 border-rose-200",
  hired: "text-cyan-700 bg-cyan-50 border-cyan-200",
};

const emptyForm = {
  title: "", description: "", requirements: "", jobType: "full_time",
  salaryMin: "", salaryMax: "", salaryCurrency: "INR",
  workingDays: [], startTime: "", endTime: "", hoursPerDay: "",
  experience: "", skills: "", status: "open",
};

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [applications, setApplications] = useState({});

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs/shop/my-jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const fetchApplications = async (jobId) => {
    if (applications[jobId]) return;
    try {
      const res = await api.get(`/jobs/${jobId}/applications`);
      setApplications((p) => ({ ...p, [jobId]: res.data.applications || [] }));
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const toggleExpand = (jobId) => {
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    setExpandedJob(jobId);
    fetchApplications(jobId);
  };

  const openCreate = () => { setEditingJob(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title, description: job.description,
      requirements: job.requirements || "", jobType: job.jobType,
      salaryMin: job.salaryMin ?? "", salaryMax: job.salaryMax ?? "",
      salaryCurrency: job.salaryCurrency || "INR",
      workingDays: job.workingDays || [], startTime: job.startTime || "",
      endTime: job.endTime || "", hoursPerDay: job.hoursPerDay ?? "",
      experience: job.experience || "", skills: (job.skills || []).join(", "),
      status: job.status,
    });
    setShowForm(true);
  };

  const handleDayToggle = (day) => {
    setForm((p) => ({
      ...p,
      workingDays: p.workingDays.includes(day)
        ? p.workingDays.filter((d) => d !== day)
        : [...p.workingDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      Swal.fire({ icon: "warning", title: "Required", text: "Title and description are required", confirmButtonColor: "#0f172a" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
        hoursPerDay: form.hoursPerDay ? parseFloat(form.hoursPerDay) : null,
      };
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, payload);
        Swal.fire({ icon: "success", title: "Updated!", confirmButtonColor: "#0f172a", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/jobs", payload);
        Swal.fire({ icon: "success", title: "Job Posted!", confirmButtonColor: "#0f172a", timer: 1500, showConfirmButton: false });
      }
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || "Failed to save job", confirmButtonColor: "#0f172a" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId) => {
    const result = await Swal.fire({
      title: "Delete this job?", text: "All applications will also be deleted.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Delete", confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((p) => p.filter((j) => j.id !== jobId));
    } catch {
      Swal.fire({ icon: "error", title: "Failed to delete", confirmButtonColor: "#0f172a" });
    }
  };

  const handleStatusUpdate = async (applicationId, jobId, status) => {
    try {
      await api.patch(`/jobs/applications/${applicationId}/status`, { status });
      setApplications((p) => ({
        ...p,
        [jobId]: (p[jobId] || []).map((a) => a.id === applicationId ? { ...a, status } : a),
      }));
    } catch {
      Swal.fire({ icon: "error", title: "Failed to update status", confirmButtonColor: "#0f172a" });
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manage Jobs</h1>
            <p className="text-slate-500 text-sm mt-0.5">Post and manage job openings for your salon</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition"
          >
            <Plus className="h-4 w-4" /> Post Job
          </button>
        </div>

        {/* Job form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-slate-100 shadow-md p-6 mb-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{editingJob ? "Edit Job" : "Post a New Job"}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Job Title *</label>
                <input required type="text" placeholder="e.g. Senior Barber, Hair Stylist"
                  value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputCls} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Description *</label>
                <textarea required rows={4} placeholder="Describe the role, responsibilities..."
                  value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className={`${inputCls} resize-none`} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Requirements</label>
                <textarea rows={3} placeholder="Qualifications, certifications, etc."
                  value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                  className={`${inputCls} resize-none`} />
              </div>

              <div>
                <label className={labelCls}>Job Type</label>
                <select value={form.jobType} onChange={(e) => setForm((p) => ({ ...p, jobType: e.target.value }))} className={inputCls}>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={inputCls}>
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Min Salary (₹/month)</label>
                <input type="number" placeholder="e.g. 15000" value={form.salaryMin}
                  onChange={(e) => setForm((p) => ({ ...p, salaryMin: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Max Salary (₹/month)</label>
                <input type="number" placeholder="e.g. 30000" value={form.salaryMax}
                  onChange={(e) => setForm((p) => ({ ...p, salaryMax: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Start Time</label>
                <input type="time" value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>End Time</label>
                <input type="time" value={form.endTime}
                  onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Hours per Day</label>
                <input type="number" step="0.5" placeholder="e.g. 8" value={form.hoursPerDay}
                  onChange={(e) => setForm((p) => ({ ...p, hoursPerDay: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Experience Required</label>
                <input type="text" placeholder="e.g. 1-2 years, Fresher OK" value={form.experience}
                  onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} className={inputCls} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Skills (comma separated)</label>
                <input type="text" placeholder="e.g. Hair cutting, Beard trimming, Hair coloring"
                  value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} className={inputCls} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        form.workingDays.includes(day)
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition disabled:opacity-60">
                {saving ? "Saving..." : editingJob ? "Update Job" : "Post Job"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-sm hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Jobs list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse border border-slate-100" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold text-slate-600">No jobs posted yet</p>
            <p className="text-sm mt-1">Click "Post Job" to create your first listing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        job.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : job.status === "paused" ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400">{JOB_TYPE_LABELS[job.jobType]}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{job.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {job._count?.applications || 0} application{job._count?.applications !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(job)}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-cyan-200 transition" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(job.id)}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggleExpand(job.id)}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition" title="View applications">
                      {expandedJob === job.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Applications panel */}
                {expandedJob === job.id && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Applications</h4>
                    {!applications[job.id] ? (
                      <p className="text-xs text-slate-400">Loading...</p>
                    ) : applications[job.id].length === 0 ? (
                      <p className="text-xs text-slate-400">No applications yet</p>
                    ) : (
                      <div className="space-y-3">
                        {applications[job.id].map((app) => (
                          <div key={app.id} className="rounded-xl bg-white border border-slate-100 shadow-sm p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{app.applicantName}</p>
                                <p className="text-xs text-slate-500">{app.applicantPhone}</p>
                                {app.applicantEmail && <p className="text-xs text-slate-500">{app.applicantEmail}</p>}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${APP_STATUS_COLORS[app.status] || ""}`}>
                                {app.status}
                              </span>
                            </div>
                            {app.experience && (
                              <p className="text-xs text-slate-600 mb-1"><span className="text-slate-400">Experience:</span> {app.experience}</p>
                            )}
                            {app.coverLetter && (
                              <p className="text-xs text-slate-500 mb-2 line-clamp-2">{app.coverLetter}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {["reviewed", "shortlisted", "hired", "rejected"].map((s) => (
                                <button key={s} onClick={() => handleStatusUpdate(app.id, job.id, s)}
                                  disabled={app.status === s}
                                  className={`text-xs px-2.5 py-1 rounded-lg border transition disabled:opacity-40 ${
                                    app.status === s
                                      ? "bg-slate-100 border-slate-200 text-slate-400"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                  }`}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
