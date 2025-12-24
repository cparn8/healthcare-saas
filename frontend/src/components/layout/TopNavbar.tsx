// frontend/src/components/layout/TopNavbar.tsx

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from "../ui/Dropdown";
import API from "../../services/api";
import { useBusinessSettings } from "../../features/locations/hooks/useBusinessSettings";

import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import User from "lucide-react/dist/esm/icons/user";
import Settings from "lucide-react/dist/esm/icons/settings";
import Sun from "lucide-react/dist/esm/icons/sun";
import Moon from "lucide-react/dist/esm/icons/moon";

type ProviderInfo = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_admin?: boolean;
};

type TopbarProps = {
  onLogout: () => void;
  onOpenProfile?: () => void; // 🔹 modal hook (wired later)
};

const TopNavbar: React.FC<TopbarProps> = ({ onLogout, onOpenProfile }) => {
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  /* --------------------- Business Settings --------------------- */
  const { businessSettings, loading: loadingBusiness } = useBusinessSettings();

  const businessName =
    businessSettings?.show_name_in_nav && businessSettings?.name
      ? businessSettings.name
      : null;

  /* --------------------- Provider Profile ---------------------- */
  useEffect(() => {
    const cached = localStorage.getItem("provider");
    if (cached) setProvider(JSON.parse(cached));

    API.get("/auth/me/")
      .then((res) => {
        setProvider(res.data);
        localStorage.setItem("provider", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error("Failed to load provider info", err);
      });
  }, []);

  const providerName = provider
    ? `${provider.first_name} ${provider.last_name}`
    : "Loading…";

  return (
    <div className="flex justify-between items-center bg-top dark:bg-top-dark px-4 py-2 gap-4">
      {/* ---------------- LEFT: Business Name ---------------- */}
      <div className="flex items-center">
        {!loadingBusiness && businessName && (
          <span className="text-2xl font-bold text-text-primary dark:text-text-darkPrimary">
            {businessName}
          </span>
        )}
      </div>

      {/* ---------------- RIGHT: Provider Menu ---------------- */}
      <div className="flex items-center gap-4">
        <Dropdown
          trigger={({ open, toggle }) => (
            <button
              onClick={toggle}
              className={`
        inline-flex items-end
        border px-3 py-1.5 rounded-md
        transition
        ${
          open
            ? "bg-primary-lighter text-primary-hover border-primary-light dark:bg-primary-dlighter dark:text-primary-ddarker dark:border-primary-dlight"
            : "bg-side dark:bg-top-lighter text-text-primary dark:text-text-darkPrimary border-top-border dark:border-top-dborder hover:bg-primary-lighter hover:dark:bg-primary-dlighter hover:text-primary-hover hover:dark:text-primary-ddarker hover:border-primary-light hover:dark:border-primary-dlight"
        }
      `}
            >
              <span>{providerName}</span>
              <ChevronDown
                className={`
          h-4 w-4 transition-transform duration-200 ease-out
          ${open ? "rotate-180" : "rotate-0"}
        `}
              />
            </button>
          )}
        >
          {/* Profile (modal trigger, not navigation) */}
          <button
            type="button"
            onClick={() => onOpenProfile?.()}
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-text-primary dark:text-text-darkPrimary bg-side dark:bg-side-dark hover:bg-top hover:dark:bg-top-dark"
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          {/* Settings (formerly Manage Users) */}
          <NavLink
            to="/doctor/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-text-primary dark:text-text-darkPrimary bg-side dark:bg-side-dark hover:bg-top hover:dark:bg-top-dark ${
                isActive ? "font-semibold text-blue-700 bg-blue-50" : ""
              }`
            }
          >
            <Settings className="h-4 w-4 text-text-primary dark:text-text-darkPrimary" />
            Settings
          </NavLink>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="
    w-full flex items-center justify-between gap-3
    px-5 py-2 text-left text-sm
    bg-side dark:bg-side-dark
    hover:bg-top hover:dark:bg-top-dark
  "
          >
            {/* Label */}
            <div className="flex flex-col">
              <span className="text-text-primary dark:text-text-darkPrimary">
                Theme
              </span>
              <span className="text-s capitalize text-text-muted dark:text-text-darkMuted">
                {theme}
              </span>
            </div>

            {/* Toggle */}
            <div
              className="
      relative inline-flex items-center
      h-7 w-12 rounded-full
      bg-top-darker dark:bg-border-dark
      transition-colors
    "
            >
              <span
                className={`
        absolute left-0.5 top-0.5
        h-6 w-6 rounded-full bg-toggle dark:bg-toggle-dark shadow
        flex items-center justify-center
        transition-transform
        ${theme === "dark" ? "translate-x-5" : "translate-x-0"}
      `}
              >
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-white" />
                ) : (
                  <Sun className="h-4 w-4 text-text-primary" />
                )}
              </span>
            </div>
          </button>
        </Dropdown>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="bg-reddel dark:bg-reddel-dark text-input border border-reddel-border dark:border-reddel-dborder px-3 py-2 rounded hover:bg-reddel-hover hover:dark:bg-reddel-dhover transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
