import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { stateDistrictCityData } from "../utils/locationData";
import {
  Briefcase, MapPin, Clock, IndianRupee, Search,
  Filter, ChevronDown, ChevronUp, X, Calendar, Users, CheckCircle
} from "lucide-react";

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

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

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [cities, setCities] = useState([]);

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (jobType) params.jobType = jobType;
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (minSalary) params.minSalary = minSalary;
      if (maxSalary) params.maxSalary = maxSalary;

      const res = await api.get("/jobs", { params });
      setJobs(res.data.jobs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [search, jobType, selectedState, selectedCity, minSalary, maxSalary]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity("");
    const allCities = Object.values(stateDistrictCityData[state] || {}).flat();
    setCities([...new Set(allCities)].sort());
  };

  const clearFilters = () => {
    setSearch("");
    setJobType("");
    setSelectedState("");
    setSelectedCity("");
    setMinSalary("");
    setMaxSalary("");
    setCities([]);
  };

  const hasActiveFilters = search || jobType || selectedState || selectedCity || minSalary || maxSalary;

  const formatSalary = (min, max, currency = "INR") => {
    const symbol = currency === "INR" ? "₹" : currency;
    if (min && max) return `${symbol}${Number(min).toLocaleString()} – ${symbol}${Number(max).toLocaleString()}/mo`;
    if (min) return `From ${symbol}${Number(min).toLocaleString()}/mo`;
    if (max) return `Up to ${symbol}${Number(max).toLocaleString()}/mo`;
    return "Salary not specified";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-3 py-6 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.18)] backdrop-blur px-6 py-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Salon <span className="bg-gradient-to-r from-cyan-600 to-amber-500 bg-clip-text text-transparent">Jobs</span>
        </h1>
        <p className="text-slate-500 text-sm mb-6">Find your next opportunity in the salon industry</p>

        <div className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs(1)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100"
            />
          </div>
          <button
            onClick={() => fetchJobs(1)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition"
          >
            Search
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">
            {loading ? "Loading..." : `${pagination.total} job${pagination.total !== 1 ? "s" : ""} found`}
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-cyan-400"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={handleStateChange}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-cyan-400"
            >
              <option value="">All States</option>
              {Object.keys(stateDistrictCityData).sort().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-cyan-400 disabled:opacity-40"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Min salary"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full pl-6 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Max salary"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full pl-6 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        {/* Job cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white/60 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold text-slate-600">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className={`group block rounded-2xl bg-white border p-5 shadow-sm hover:shadow-md transition-all duration-200 no-underline ${
                  job.hasApplied
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-slate-100 hover:border-cyan-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {job.hasApplied && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3" /> Applied
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${JOB_TYPE_COLORS[job.jobType] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-amber-600 mb-3">{job.shop?.shopname}</p>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{[job.shop?.city, job.shop?.state].filter(Boolean).join(", ") || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                  </div>
                  {job.workingDays?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{job.workingDays.slice(0, 3).join(", ")}{job.workingDays.length > 3 ? "..." : ""}</span>
                    </div>
                  )}
                  {(job.startTime || job.endTime) && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{[job.startTime, job.endTime].filter(Boolean).join(" – ")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 2).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
                      ))}
                      {job.skills.length > 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">+{job.skills.length - 2}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                    <Users className="h-3 w-3" />
                    <span>{job._count?.applications || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchJobs(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  p === pagination.page
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
