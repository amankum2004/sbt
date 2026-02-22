const Poster = () => {
  const posterUrl = "/salonHub-Poster.png";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />

      <section className="relative mx-auto mt-6 w-full max-w-3xl rounded-3xl border border-white/70 bg-white/90 p-6 text-center shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
        <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Media Kit
        </p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">SalonHub Poster</h2>
        <p className="mt-2 text-sm text-slate-600">
          Download and share the official SalonHub poster.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <img
            src={posterUrl}
            alt="SalonHub Poster"
            className="mx-auto w-full max-w-md rounded-xl shadow-[0_18px_40px_-20px_rgba(15,23,42,0.5)]"
          />
        </div>

        <a
          href={posterUrl}
          download="SalonHub-Poster.png"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:brightness-110"
        >
          Download Poster
        </a>
      </section>
    </main>
  );
};

export default Poster;
