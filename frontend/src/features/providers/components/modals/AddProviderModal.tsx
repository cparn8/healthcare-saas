// frontend/src/features/providers/components/modals/AddProviderModal.tsx
import React, { useState } from "react";
import X from "lucide-react/dist/esm/icons/x";
import FormField from "../../../../components/ui/FormField";
import { providersApi, Provider } from "../../services/providersApi";
import { toastError, toastSuccess } from "../../../../utils/toastUtils";

interface AddProviderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (provider: Provider) => void;
  isAdmin: boolean;
}

type Errors = Record<string, string>;

const AddProviderModal: React.FC<AddProviderModalProps> = ({
  open,
  onClose,
  onCreated,
  isAdmin,
}) => {
  const [formData, setFormData] = useState<Partial<Provider>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialty: "",
  });
  const [passwords, setPasswords] = useState({
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      toastError("You do not have permission to create providers.");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload: Partial<Provider> = {
        ...formData,
        password: passwords.password,
        confirm_password: passwords.confirm_password,
      };

      const created = await providersApi.create(payload);
      toastSuccess("Provider created successfully.");
      onCreated(created);

      // reset
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialty: "",
      });
      setPasswords({ password: "", confirm_password: "" });
      onClose();
    } catch (err: any) {
      console.error("Create provider error", err);
      if (err && typeof err === "object") {
        setErrors(err as Errors);
      } else {
        toastError("Failed to create provider.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-darkPrimary">
            Add Provider
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-text-primary dark:text-text-darkPrimary ">
          {!isAdmin && (
            <p className="text-sm text-reddel mb-2">
              You do not have permission to add providers.
            </p>
          )}

          <FormField
            type="text"
            name="first_name"
            label="First Name"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={formData.first_name ?? ""}
            onChange={handleChange}
            error={errors.first_name}
          />

          <FormField
            type="text"
            name="last_name"
            label="Last Name"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={formData.last_name ?? ""}
            onChange={handleChange}
            error={errors.last_name}
          />

          <FormField
            type="email"
            name="email"
            label="Email"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={formData.email ?? ""}
            onChange={handleChange}
            error={errors.email}
          />

          <FormField
            type="text"
            name="phone"
            label="Phone"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={formData.phone ?? ""}
            onChange={handleChange}
            error={errors.phone}
          />

          <FormField
            type="text"
            name="specialty"
            label="Specialty"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={formData.specialty ?? ""}
            onChange={handleChange}
            error={errors.specialty}
          />

          {/* Password fields (admin sets initial password) */}
          <FormField
            type="password"
            name="password"
            label="Password"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={passwords.password}
            onChange={handlePasswordChange}
            error={errors.password}
          />

          <FormField
            type="password"
            name="confirm_password"
            label="Confirm Password"
            className="border border-mBorder dark:border-border-dark rounded p-2 bg-input dark:bg-surface-dark"
            value={passwords.confirm_password}
            onChange={handlePasswordChange}
            error={errors.confirm_password}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-bg dark:border-bg-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !isAdmin}
            className={`px-4 py-2 rounded text-input-lighter transition ${
              submitting || !isAdmin
                ? "bg-top cursor-not-allowed"
                : "bg-grncon hover:bg-grncon-hover"
            }`}
          >
            {submitting ? "Saving..." : "Save Provider"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProviderModal;
