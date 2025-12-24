import React, { useState, useEffect } from "react";
import X from "lucide-react/dist/esm/icons/x";
import ProviderForm, { ProviderFormValues } from "../forms/ProviderForm";
import { providersApi, Provider } from "../../services/providersApi";
import {
  validateProvider,
  ProviderPayload,
} from "../../../../utils/validation";
import { toastError, toastSuccess } from "../../../../utils/toastUtils";

interface EditProviderModalProps {
  open: boolean;
  provider: Provider | null;
  onClose: () => void;
  onUpdated?: (provider: Provider) => void;
}

const EditProviderModal: React.FC<EditProviderModalProps> = ({
  open,
  provider,
  onClose,
  onUpdated,
}) => {
  const [values, setValues] = useState<ProviderFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialty: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && provider) {
      setValues({
        first_name: provider.first_name,
        last_name: provider.last_name,
        email: provider.email || "",
        phone: provider.phone || "",
        specialty: provider.specialty || "",
      });
      setErrors({});
    }
  }, [open, provider]);

  if (!open || !provider) return null;

  const handleChange = (patch: Partial<ProviderFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    const basePayload: ProviderPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || "",
      specialty: values.specialty || "",
    } as ProviderPayload;

    const validationErrors = validateProvider(basePayload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updated = await providersApi.update(provider.id!, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        specialty: values.specialty,
      });

      toastSuccess("Provider updated successfully.");
      onUpdated?.(updated);
      onClose();
    } catch (err: any) {
      if (err && typeof err === "object") {
        setErrors(err as Record<string, string>);
      } else {
        toastError("Failed to update provider.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg dark:bg-bg-dark rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg dark:border-bg-dark">
          <h2 className="text-xl font-semibold">Edit Provider</h2>
          <button
            onClick={onClose}
            className="text-text-muted dark:text-text-darkMuted hover:text-text-primary dark:text-text-darkPrimary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <ProviderForm
            values={values}
            errors={errors}
            includePasswordFields={false}
            onChange={handleChange}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-bg dark:border-bg-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-side dark:bg-dButton-mbg border border-mBorder dark:border-dButton-mborder text-text-primary dark:text-text-darkPrimary hover:bg-top hover:dark:bg-dButton-mhover transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-input-lighter transition ${
              isSubmitting
                ? "bg-top dark:bg-top-dark cursor-wait"
                : "bg-grncon hover:bg-grncon-hover"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProviderModal;
