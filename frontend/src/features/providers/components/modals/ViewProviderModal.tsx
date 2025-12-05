// frontend/src/features/providers/components/modals/ViewProviderModal.tsx
import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import FormField from "../../../../components/ui/FormField";
import { providersApi, Provider } from "../../services/providersApi";
import { toastError, toastSuccess } from "../../../../utils/toastUtils";

interface ViewProviderModalProps {
  open: boolean;
  provider: Provider | null;
  currentProvider: Provider | null;
  onClose: () => void;
  onUpdated: (updated: Provider) => void;
  onChangePassword: (target: Provider) => void;
}

const ViewProviderModal: React.FC<ViewProviderModalProps> = ({
  open,
  provider,
  currentProvider,
  onClose,
  onUpdated,
  onChangePassword,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>(provider ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!open || !provider) return null;

  const isAdmin =
    !!currentProvider &&
    !!(
      currentProvider.is_admin === true ||
      currentProvider.is_staff === true ||
      currentProvider.is_superuser === true
    );
  const isSelf = !!currentProvider && currentProvider.id === provider.id;
  const canEdit = isAdmin || isSelf;
  const canChangePassword = canEdit;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!canEdit) {
      toastError("You do not have permission to edit this provider.");
      return;
    }
    if (!provider.id) {
      toastError("Invalid provider.");
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const updated = await providersApi.update(provider.id, formData);
      toastSuccess("Provider updated.");
      onUpdated(updated);
      setEditMode(false);
    } catch (err: any) {
      console.error("Update provider error", err);
      if (err && typeof err === "object") {
        setErrors(err as Record<string, string>);
      } else {
        toastError("Failed to update provider.");
      }
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setEditMode(false);
    setFormData(provider);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {provider.first_name} {provider.last_name}
          </h2>
          <button
            onClick={resetAndClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!editMode ? (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={
                    provider.profile_picture ||
                    "/images/provider-placeholder.png"
                  }
                  alt="profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{provider.email}</p>
                  <p>{provider.phone}</p>
                  {provider.specialty && (
                    <p className="text-gray-600">{provider.specialty}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <form className="space-y-4">
              <FormField
                type="text"
                name="first_name"
                label="First Name"
                value={formData.first_name ?? ""}
                onChange={handleChange}
                error={errors.first_name}
              />

              <FormField
                type="text"
                name="last_name"
                label="Last Name"
                value={formData.last_name ?? ""}
                onChange={handleChange}
                error={errors.last_name}
              />

              <FormField
                type="email"
                name="email"
                label="Email"
                value={formData.email ?? ""}
                onChange={handleChange}
                error={errors.email}
              />

              <FormField
                type="text"
                name="phone"
                label="Phone"
                value={formData.phone ?? ""}
                onChange={handleChange}
                error={errors.phone}
              />

              <FormField
                type="text"
                name="specialty"
                label="Specialty"
                value={formData.specialty ?? ""}
                onChange={handleChange}
                error={errors.specialty}
              />
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-2">
            {canChangePassword && (
              <button
                onClick={() => onChangePassword(provider)}
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Change Password
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {canEdit && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
            )}

            {editMode && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-2 rounded text-white transition ${
                    saving
                      ? "bg-gray-400 cursor-wait"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData(provider);
                    setErrors({});
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            )}

            {!editMode && (
              <button
                onClick={resetAndClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProviderModal;
