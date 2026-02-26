import React, { createContext, useContext, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const LoadingContext = createContext();

const SPINNER_SIZE_CLASSES = {
  xs: "h-3.5 w-3.5 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
  xl: "h-12 w-12 border-4",
};

const SPINNER_COLOR_CLASSES = "border-cyan-500/70 border-t-amber-400";

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = SPINNER_SIZE_CLASSES[size] || SPINNER_SIZE_CLASSES.md;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`animate-spin rounded-full ${sizeClasses} ${SPINNER_COLOR_CLASSES} ${className}`}
    />
  );
};

export const LoadingIndicator = ({
  label,
  size = "md",
  className = "",
  labelClassName = "",
}) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <LoadingSpinner size={size} />
    {label ? (
      <span className={`text-sm font-medium text-slate-600 ${labelClassName}`}>
        {label}
      </span>
    ) : null}
  </div>
);

export const LoadingProvider = ({ children }) => {
  useEffect(() => {
    if (document.getElementById("salonhub-swal-spinner")) return;
    const style = document.createElement("style");
    style.id = "salonhub-swal-spinner";
    style.textContent = `
      .swal2-loader {
        border-color: rgba(6, 182, 212, 0.7) !important;
        border-top-color: #f59e0b !important;
        width: 3rem !important;
        height: 3rem !important;
        border-width: 4px !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const loadingHtml = useMemo(
    () =>
      `
      <div class="flex flex-col items-center justify-center gap-3 py-2">
        <div class="h-12 w-12 rounded-full border-4 border-cyan-500/70 border-t-amber-400 animate-spin"></div>
        <p class="text-sm font-semibold text-slate-600 loading-message"></p>
      </div>
    `,
    []
  );

  const showLoading = (message = 'Please wait...') => {
    Swal.fire({
      html: loadingHtml,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "rounded-2xl border border-white/70 bg-white/95 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]",
      },
      didOpen: () => {
        const messageEl = Swal.getHtmlContainer()?.querySelector(".loading-message");
        if (messageEl) {
          messageEl.textContent = message;
        }
      },
    });
  };

  const hideLoading = () => {
    Swal.close();
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

