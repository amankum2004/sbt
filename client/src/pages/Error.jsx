import React from "react";
import { NavLink } from "react-router-dom";

export const Error = () => {
    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-amber-50 px-4 py-12">
            <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-36 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />

            <section className="relative mx-auto mt-8 flex w-full max-w-2xl justify-center text-center">
                <div className="w-full rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
                    <p className="text-8xl font-black tracking-tight text-slate-900 sm:text-9xl">404</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Page Not Found</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 sm:text-base">
                        The page you are trying to access does not exist or may have been moved.
                    </p>

                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <NavLink
                            to="/"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 sm:w-auto"
                        >
                            Return to Home
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 sm:w-auto"
                        >
                            Report Problem
                        </NavLink>
                    </div>
                </div>
            </section>
        </main>
    );
};
