// frontend/src/features/locations/pages/BusinessSettingsPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessSettings, useLocations } from "../hooks";
import { toastError, toastSuccess } from "../../../utils";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import PlusCircle from "lucide-react/dist/esm/icons/plus-circle";
import { formatLocationHours } from "../utils/formatHours";

import BusinessNameModal from "../components/BusinessNameModal";
import AddLocationModal from "../components/AddLocationModal";
import EditLocationModal from "../components/EditLocationModal";
import ConfirmDeleteLocationModal from "../components/ConfirmDeleteLocationModal";
import EditLocationHoursModal from "../components/EditLocationHoursModal";

import {
  LocationDTO,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../services/locationApi";

const BusinessSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationDTO | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<LocationDTO | null>(null);
  const [openMenuLocationId, setOpenMenuLocationId] = useState<number | null>(
    null
  );

  const [hoursModalLocation, setHoursModalLocation] =
    useState<LocationDTO | null>(null);

  const {
    businessSettings,
    loading: loadingBusiness,
    error: businessError,
    save: saveBusinessSettings,
  } = useBusinessSettings();

  const {
    locations,
    loading: loadingLocations,
    error: locationsError,
    reload: reloadLocations,
  } = useLocations();

  /* ------------------------------- Error UI ------------------------------- */
  if (businessError || locationsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          Failed to load business settings or locations.
        </div>
      </div>
    );
  }

  /* ------------------------------- Loading UI ----------------------------- */
  if (loadingBusiness || loadingLocations || !businessSettings) {
    return (
      <div className="p-6 text-text-primary dark:text-text-darkPrimary">
        Loading business settings…
      </div>
    );
  }

  /* --------------------------- Handlers: Locations ------------------------ */

  const handleCreateLocation = async (payload: Partial<LocationDTO>) => {
    try {
      await createLocation(payload);
      toastSuccess("Location created.");
      await reloadLocations();
    } catch (err: any) {
      console.error("❌ Failed to create location:", err);
      toastError("Failed to create location.");
      throw err;
    }
  };

  const handleSaveLocation = async (
    id: number,
    patch: Partial<LocationDTO>
  ) => {
    try {
      await updateLocation(id, patch);
      toastSuccess("Location updated.");
      await reloadLocations();
    } catch (err: any) {
      console.error("❌ Failed to update location:", err);
      toastError("Failed to update location.");
      throw err;
    }
  };

  const handleRequestDeleteFromEdit = (loc: LocationDTO) => {
    // Close edit modal, then open confirm delete modal (Option A).
    setEditingLocation(null);
    setDeleteTarget(loc);
  };

  const handleRequestDeleteFromCard = (loc: LocationDTO) => {
    setDeleteTarget(loc);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteLocation(deleteTarget.id);
      toastSuccess("Location deleted.");
      setDeleteTarget(null);
      await reloadLocations();
    } catch (err: any) {
      console.error("❌ Failed to delete location:", err);

      const detail: string | undefined = err?.response?.data?.detail;

      if (
        err?.response?.status === 400 &&
        typeof detail === "string" &&
        detail.toLowerCase().includes("existing appointments")
      ) {
        // Backend guard: cannot delete if any appointments exist.
        toastError(
          "This location cannot be deleted because there are existing appointments associated with it. " +
            "Please reschedule or archive those appointments before deleting the location."
        );
      } else {
        toastError("Failed to delete location.");
      }
    }
  };

  /* ====================================================================== */
  /*                             MAIN LAYOUT                                */
  /* ====================================================================== */

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/doctor/settings")}
        className="mb-4 text-sm inline-flex items-center bg-primary border border-primary px-3 py-1.5 rounded-md text-text-darkPrimary hover:bg-primary-hover"
      >
        ← Back to Settings
      </button>
      <div className="max-w-6xl mx-auto space-y-10 flex flex-col items-center">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl text-center font-bold text-text-primary dark:text-text-darkPrimary">
            Business Settings
          </h1>
          <p className="text-center text-text-secondary dark:text-text-darkSecondary mt-1">
            Manage business name visibility, locations, and office hours.
          </p>
        </div>

        {/* ================================================================== */}
        {/*                    BUSINESS NAME + NAV VISIBILITY                   */}
        {/* ================================================================== */}
        <section className="bg-surface dark:bg-surface-dark inline-block max-w-xl border border border-border dark:border-border-dark rounded-xl shadow-sm p-5">
          <div className="flex items-start text-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary dark:text-text-darkPrimary">
                Business Name
              </h2>
              <p className="text-md text-text-secondary dark:text-text-darkSecondary mt-1">
                This name can appear on the top navigation bar.
              </p>

              <div className="mt-4">
                <p className="text-lg font-semibold font-medium text-text-primary dark:text-text-darkPrimary">
                  {businessSettings.name || "No name set"}
                </p>
                <p className="text-md text-text-secondary dark:text-text-darkSecondary mt-1">
                  Visible in navigation:{" "}
                  <span className="font-semibold">
                    {businessSettings.show_name_in_nav ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </div>

            {/* Ellipses → Edit business name */}
            <div className="relative">
              <button
                className="p-2 rounded"
                onClick={() => setEditNameOpen(true)}
              >
                <MoreVertical className="h-5 w-5 text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:hover:text-text-darkPrimary" />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/*                               LOCATIONS                            */}
        {/* ================================================================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-text-darkPrimary">
                Locations
              </h2>
              <p className="text-md text-text-secondary dark:text-text-darkSecondary mt-1">
                Manage multiple physical or logical practice locations.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 bg-grncon text-input px-4 py-2 rounded-lg hover:bg-grncon-hover text-sm"
              onClick={() => setAddLocationOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Add Location
            </button>
          </div>

          {/* ------------------------ Locations List ------------------------- */}
          <div className="flex flex-wrap gap-6">
            {locations.length === 0 && (
              <p className="text-sm text-text-secondary dark:text-text-darkSecondary italic">
                No locations found.
              </p>
            )}

            {locations.map((loc) => {
              const summary = formatLocationHours(loc.hours);

              return (
                <div
                  key={loc.id}
                  className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-sm p-5 w-full sm:w-[340px]"
                >
                  <div className="flex items-start justify-normal">
                    {/* ----------------------- INFO SECTION ----------------------- */}
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-text-primary dark:text-text-darkPrimary">
                          {loc.name}
                        </h3>
                        {!loc.is_active && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-darkSecondary border border-border dark:border-border-dark">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-text-secondary dark:text-text-darkSecondary">
                        {loc.phone && <p>Phone: {loc.phone}</p>}
                        {loc.email && <p>Email: {loc.email}</p>}
                        {loc.address && <p>Address: {loc.address}</p>}
                        {!loc.phone && !loc.email && !loc.address && (
                          <p className="text-text-muted dark:text-text-darkMuted italic">
                            No contact information provided.
                          </p>
                        )}

                        <p className="text-xs text-text-muted dark:text-text-darkMuted mt-2">
                          Key: <span className="font-mono">{loc.slug}</span>
                        </p>
                      </div>
                    </div>

                    {/* ------------------ ACTION MENU ------------------ */}
                    <div className="relative">
                      <button
                        className="p-2 rounded"
                        onClick={() =>
                          setOpenMenuLocationId(
                            openMenuLocationId === loc.id ? null : loc.id
                          )
                        }
                      >
                        <MoreVertical className="h-5 w-5 text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:hover:text-text-darkPrimary" />
                      </button>

                      {openMenuLocationId === loc.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-bg dark:bg-bg-dark border border-bg dark:border-border-dark rounded-lg shadow-lg z-20">
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-side hover:dark:bg-side-dark"
                            onClick={() => {
                              setEditingLocation(loc);
                              setOpenMenuLocationId(null);
                            }}
                          >
                            Edit Info
                          </button>

                          <button
                            className="w-full text-left px-3 py-2 text-sm text-reddel hover:bg-side hover:dark:bg-side-dark"
                            onClick={() => {
                              handleRequestDeleteFromCard(loc);
                              setOpenMenuLocationId(null);
                            }}
                          >
                            Delete Location...
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ------------------ BUSINESS HOURS PLACEHOLDER ------------------ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-medium text-text-primary dark:text-text-darkPrimary mb-2">
                        Business Hours
                      </h4>
                      <div className="text-xs text-text-secondary dark:text-text-darkSecondary mb-1 space-y-0.5">
                        {summary.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border dark:border-dButton-border text-xs font-medium text-text-primary dark:text-text-darkPrimary bg-bg dark:bg-dButton hover:bg-side hover:dark:bg-dButton-hover"
                        onClick={() => setHoursModalLocation(loc)}
                      >
                        Edit Hours
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================= MODALS ========================= */}

        {/* Business Name */}
        <BusinessNameModal
          open={editNameOpen}
          initial={businessSettings}
          onClose={() => setEditNameOpen(false)}
          onSave={saveBusinessSettings}
        />

        {/* Add Location */}
        <AddLocationModal
          open={addLocationOpen}
          onClose={() => setAddLocationOpen(false)}
          onCreate={handleCreateLocation}
        />

        {/* Edit Location */}
        <EditLocationModal
          open={!!editingLocation}
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onSave={handleSaveLocation}
          onRequestDelete={handleRequestDeleteFromEdit}
        />

        {/* Confirm Delete */}
        <ConfirmDeleteLocationModal
          open={!!deleteTarget}
          location={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
        <EditLocationHoursModal
          open={!!hoursModalLocation}
          location={hoursModalLocation}
          onClose={() => setHoursModalLocation(null)}
          onUpdated={reloadLocations}
        />
      </div>
    </div>
  );
};

export default BusinessSettingsPage;
