// frontend/src/features/settings/pages/SettingsPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentProvider } from "../../providers/hooks/useCurrentProvider";
import AppointmentTypesModal from "../components/AppointmentTypesModal";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentProvider();
  const [appointmentTypesOpen, setAppointmentTypesOpen] = useState(false);

  // Local theme toggle skeleton (we'll wire real theming later)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    // TODO: hook into global theme (Tailwind class on <html> or context)
  };

  const handleOpenBusinessSettings = () => {
    if (!isAdmin) return;
    // TODO: ensure this route exists when we implement BusinessSettingsPage
    navigate("/doctor/settings/business");
  };

  const handleOpenAppointmentTypes = () => {
    if (!isAdmin) return;
    setAppointmentTypesOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure users, business settings, appointment types, and appearance.
        </p>
      </div>

      {/* Grid of settings cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                User Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage patients and providers for your practice.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate("/doctor/manage-users/patients")}
              className="w-full inline-flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium text-gray-800 transition"
            >
              <span>Manage Patients</span>
              <span className="text-xs text-gray-500">View & edit</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/doctor/manage-users/providers")}
              className="w-full inline-flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium text-gray-800 transition"
            >
              <span>Manage Providers</span>
              <span className="text-xs text-gray-500">
                View list, edit own profile
              </span>
            </button>
          </div>
        </section>

        {/* Business & Locations */}
        <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Business & Locations
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Set your business name, locations, and office hours.
              </p>
            </div>
            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                Admin only
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenBusinessSettings}
            disabled={!isAdmin}
            className={`mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              isAdmin
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Open Business Settings
          </button>

          <p className="text-xs text-gray-500">
            Includes business name visibility in the header and per-location
            contact info and business hours.
          </p>
        </section>

        {/* Appointment Types */}
        <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Appointment Types
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure appointment types, colors, and default durations.
              </p>
            </div>
            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                Admin only
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAppointmentTypes}
            disabled={!isAdmin}
            className={`mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
              isAdmin
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Manage Appointment Types
          </button>

          <p className="text-xs text-gray-500">
            We will reuse the existing Schedule Settings appointment type
            configuration here in a modal.
          </p>
        </section>

        {/* Appearance / Theme */}
        <section className="bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
            <p className="text-sm text-gray-600 mt-1">
              Switch between light and dark themes for the dashboard.
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-700">
              Theme:{" "}
              <span className="font-medium capitalize">
                {theme === "light" ? "Light" : "Dark"}
              </span>
            </span>
            <button
              type="button"
              onClick={handleThemeToggle}
              className="relative inline-flex items-center h-6 rounded-full w-11 border border-gray-300 bg-gray-100 transition"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-gray-500">
            This toggle is currently local to the Settings page; we&apos;ll wire
            it into a global theme context in a later step.
          </p>
        </section>
      </div>
      {appointmentTypesOpen && (
        <AppointmentTypesModal
          open={appointmentTypesOpen}
          onClose={() => setAppointmentTypesOpen(false)}
          onSaved={() => {
            // Optional: if future features depend on updated settings
            // may refresh context here.
            setAppointmentTypesOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SettingsPage;
