// frontend/.../forms/common/ProviderSelect.tsx
import React from "react";
import { Provider } from "../../../../../providers/services/providersApi";
import { Spinner } from "../../../../../../components/ui/Loader";

interface ProviderSelectProps {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  value: number | null | undefined;
  onChange: (providerId: number | null) => void;
  label?: string;
  allowAll?: boolean; // optional: for BlockTime mode
}

const ProviderSelect: React.FC<ProviderSelectProps> = ({
  providers,
  loading,
  error,
  value,
  onChange,
  label = "Provider",
  allowAll = false,
}) => {
  const providerFullName = (p: Provider) =>
    `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || `Provider #${p.id}`;

  return (
    <div className="space-y-1">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 border rounded p-2 bg-gray-50 text-gray-600">
          <Spinner className="h-4 w-4 text-gray-400" />
          Loading providers…
        </div>
      )}

      {/* Error */}
      {!loading && error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Select */}
      {!loading && !error && (
        <select
          className="w-full border rounded p-2"
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (allowAll && v === "__ALL__") {
              onChange(null); // represent "All Providers"
            } else {
              onChange(v ? Number(v) : null);
            }
          }}
        >
          <option value="">Select provider</option>

          {allowAll && <option value="__ALL__">All Providers</option>}

          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {providerFullName(p)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ProviderSelect;
