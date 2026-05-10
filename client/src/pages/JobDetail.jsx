import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import { useLogin } from "../components/LoginContext";
import Swal from "sweetalert2";
import {
  Briefcase, MapPin, Clock, IndianRupee, Calendar,
  Users, ArrowLeft, CheckCircle, ChevronRight
} from "lucide-react";

const JOB_TYPE_LABELS = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

const JOB_TYPE_COLORS = {
  full_time: "bg-emerald-50 text-emerald-700 border-emerald-200",
  part_time: "bg-blue-50 text-blue-700 border-blue-200",
  contract: "bg-amber-50 text-amber-700 border-amber-200",
  internship: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { loggedIn } = useLogin();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [form, setForm] = useState({ coverLetter: "", experience: "" });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data.job);
        if (res.data.job?.hasApplied) {
          setApplied(true);
        }
      } catch {
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!loggedIn) { navigate("/login"); return; }
    setApplying(true);
    try {
      await api.post(`/jobs/${jobId}/apply`, form);
      setApplied(true);
      setShowApplyForm(false);
      Swal.fire({
        icon: "success",
        title: "Application Submitted!",
        text: "The salon owner will review your application.",
        confirmButtonColor: "#0f172a",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit application";
      if (msg.includes("already applied")) setApplied(true);
      Swal.fire({ icon: "error", title: "Oops", text: msg, confirmButtonColor: "#0f172a" });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min, max, currency = "INR") => {
    const symbol = currency === "INR" ? "₹" : currency;
    if (min && max) return `${symbol}${Number(min).toLocaleString()} – ${symbol}${Number(max).toLocaleString()} / month`;
    if (min) return `From ${symbol}${Number(min).toLocaleString()} / month`;
    if (max) return `Up to ${symbol}${Number(max).toLocaleString()} / month`;
    return "Salary not specified";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition mb-6 no-underline">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>

        {/* Header card */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-md p-6 mb-4">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-1">{job.title}</h1>
              <p className="text-amber-600 font-semibold">{job.shop?.shopname}</p>
            </div>
            <span className={`shrink-0 text-xs px-3 py-1 rounded-full border font-medium ${JOB_TYPE_COLORS[job.jobType] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {JOB_TYPE_LABELS[job.jobType] || job.jobType}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-500 shrink-0" />
              <span>{[job.shop?.city, job.shop?.state].filter(Boolean).join(", ") || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            </div>
            {(job.startTime || job.endTime) && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{[job.startTime, job.endTime].filter(Boolean).join(" – ")}</span>
              </div>
            )}
            {job.hoursPerDay && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                <span>{job.hoursPerDay} hrs/day</span>
              </div>
            )}
            {job.workingDays?.length > 0 && (
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
                <span>{job.workingDays.join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{job._count?.applications || 0} applicant{job._count?.applications !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div className="mb-5">
          {applied ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm">
              <CheckCircle className="h-5 w-5" /> Application submitted
            </div>
          ) : job.status !== "open" ? (
            <div className="px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-medium">
              This job is no longer accepting applications
            </div>
          ) : (
            <button
              onClick={() => { if (!loggedIn) { navigate("/login"); return; } setShowApplyForm((p) => !p); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition"
            >
              Apply Now <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Apply form */}
        {showApplyForm && !applied && (
          <form onSubmit={handleApply} className="rounded-3xl bg-white border border-slate-100 shadow-md p-6 mb-5 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Your Application</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Your Experience</label>
              <input
                type="text"
                placeholder="e.g. 2 years as a barber at XYZ salon"
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Cover Letter (optional)</label>
              <textarea
                rows={4}
                placeholder="Tell the salon owner why you're a great fit..."
                value={form.coverLetter}
                onChange={(e) => setForm((p) => ({ ...p, coverLetter: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={applying}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition disabled:opacity-60"
              >
                {applying ? "Submitting..." : "Submit Application"}
              </button>
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-sm hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Job details */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">Job Description</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>

          {job.requirements && (
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-3">Requirements</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
            </div>
          )}

          {job.experience && (
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-2">Experience Required</h2>
              <p className="text-sm text-slate-600">{job.experience}</p>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">About the Salon</h2>
            <p className="text-sm font-semibold text-amber-600 mb-1">{job.shop?.shopname}</p>
            <p className="text-sm text-slate-500">
              {[job.shop?.street, job.shop?.city, job.shop?.district, job.shop?.state].filter(Boolean).join(", ")}
            </p>
            {job.shop?.phone && (
              <p className="text-sm text-slate-500 mt-1">📞 {job.shop.phone}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
