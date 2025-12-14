// frontend/src/components/layout/TopNavbar.tsx

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Dropdown from "../ui/Dropdown";
import API from "../../services/api";
import { useBusinessSettings } from "../../features/locations/hooks/useBusinessSettings";

type ProviderInfo = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_admin?: boolean;
};

type TopbarProps = {
  onLogout: () => void;
};

const TopNavbar: React.FC<TopbarProps> = ({ onLogout }) => {
  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const navigate = useNavigate();

  /* --------------------- Load Business Settings --------------------- */
  const { businessSettings, loading: loadingBusiness } = useBusinessSettings();

  // Determine business name visibility
  const businessName =
    businessSettings?.show_name_in_nav && businessSettings?.name
      ? businessSettings.name
      : null;

  /* --------------------- Load Provider Profile ---------------------- */
  useEffect(() => {
    // Local cache first
    const cached = localStorage.getItem("provider");
    if (cached) {
      setProvider(JSON.parse(cached));
    }

    // Refresh from backend
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
    <div className="flex justify-between items-center bg-white border-b border-gray-300 px-4 py-2 gap-4">
      {/* --------------------- LEFT SIDE: Business Name --------------------- */}
      <div className="flex items-center">
        {!loadingBusiness && businessName && (
          <span className="text-lg font-semibold text-gray-800 mr-4">
            {businessName}
          </span>
        )}
      </div>

      {/* --------------------- RIGHT SIDE: Provider & Settings --------------------- */}
      <div className="flex items-center gap-4">
        {/* Provider Menu */}
        <Dropdown
          trigger={({ toggle }) => (
            <button
              onClick={toggle}
              className="px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              {providerName} ⌄
            </button>
          )}
        >
          <NavLink
            to={
              provider
                ? `/doctor/manage-users/providers/${provider.id}`
                : "/doctor/profile"
            }
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-blue-50 ${
                isActive ? "font-semibold text-blue-700 bg-blue-50" : ""
              }`
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/doctor/provider-options"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-blue-50 ${
                isActive ? "font-semibold text-blue-700 bg-blue-50" : ""
              }`
            }
          >
            Other Option
          </NavLink>
        </Dropdown>

        {/* Settings Menu */}
        <Dropdown
          trigger={({ toggle }) => (
            <button
              onClick={toggle}
              className="px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              ⚙️ Settings
            </button>
          )}
        >
          <NavLink
            to="/doctor/notifications"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-blue-50 ${
                isActive ? "font-semibold text-blue-700 bg-blue-50" : ""
              }`
            }
          >
            Notifications
          </NavLink>
          <NavLink
            to="/doctor/manage-users"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-blue-50 ${
                isActive ? "font-semibold text-blue-700 bg-blue-50" : ""
              }`
            }
          >
            Manage Users
          </NavLink>
        </Dropdown>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;
