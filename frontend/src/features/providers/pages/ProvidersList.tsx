import React, { useEffect, useMemo, useState } from "react";
import Skeleton from "../../../components/Skeleton";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { toastError, toastSuccess } from "../../../utils/toastUtils";
import { providersApi, Provider } from "../services/providersApi";
import { useCurrentProvider } from "../hooks/useCurrentProvider";
import ProvidersTable from "../components/table/ProvidersTable";
import AddProviderModal from "../components/modals/AddProviderModal";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import ProviderProfileModal from "../components/modals/ViewProviderModal";

const ProvidersList: React.FC = () => {
  const { provider: currentProvider, isAdmin } = useCurrentProvider();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Provider | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<Provider | null>(null);

  const canEdit = (p: Provider): boolean => {
    if (!currentProvider) return false;
    if (isAdmin) return true;
    return currentProvider.id === p.id;
  };

  const canDelete = (p: Provider): boolean => {
    if (!currentProvider) return false;
    return isAdmin; // only admin can delete any provider
  };

  const canChangePassword = (p: Provider): boolean => {
    if (!currentProvider) return false;
    if (isAdmin) return true;
    return currentProvider.id === p.id;
  };

  // Fetch providers (with search)
  useEffect(() => {
    let active = true;

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const list = await providersApi.list(search || undefined);
        if (!active) return;
        setProviders(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching providers:", error);
        if (active) toastError("Failed to load providers.");
      } finally {
        if (active) setLoading(false);
      }
    };

    // simple debounce
    const id = setTimeout(fetchProviders, 250);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [search]);

  const handleOpenProfile = (p: Provider) => {
    setSelectedProvider(p);
    setProfileModalOpen(true);
  };

  const handleOpenPasswordModal = (p: Provider) => {
    if (!canChangePassword(p)) {
      toastError("You do not have permission to change this password.");
      return;
    }
    setPasswordTarget(p);
    setPasswordModalOpen(true);
  };

  const requestDelete = (p: Provider) => {
    if (!canDelete(p)) {
      toastError("You do not have permission to delete providers.");
      return;
    }
    setPendingDelete(p);
    setConfirmDeleteOpen(true);
  };

  const performDelete = async () => {
    if (!pendingDelete?.id) return;

    setConfirmDeleteOpen(false);
    setDeletingId(pendingDelete.id);

    try {
      await providersApi.delete(pendingDelete.id);
      setProviders((prev) => prev.filter((pr) => pr.id !== pendingDelete.id));
      toastSuccess("Provider deleted.");
    } catch (error) {
      console.error("Error deleting provider:", error);
      toastError("Failed to delete provider.");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  // handle add modal open with guard
  const handleOpenAddModal = () => {
    if (!isAdmin) {
      toastError("You do not have permission to add providers.");
      return;
    }
    setAddModalOpen(true);
  };

  const handleProviderCreated = (p: Provider) => {
    setProviders((prev) => [...prev, p]);
  };

  const handleProviderUpdated = (updated: Provider) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const sortedProviders = useMemo(
    () =>
      [...providers].sort((a, b) => {
        const la = (a.last_name || "").toLowerCase();
        const lb = (b.last_name || "").toLowerCase();
        if (la < lb) return -1;
        if (la > lb) return 1;
        const fa = (a.first_name || "").toLowerCase();
        const fb = (b.first_name || "").toLowerCase();
        return fa.localeCompare(fb);
      }),
    [providers]
  );

  if (loading && !providers.length) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header: Search + Add */}
      <h1 className="text-xl font-bold mb-4">Providers</h1>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search providers by name, specialty, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full max-w-md rounded"
        />
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add Provider
        </button>
      </div>

      {/* Providers Table */}
      <div className="bg-white border rounded-lg shadow-sm">
        <ProvidersTable
          providers={sortedProviders}
          loading={loading}
          deletingId={deletingId}
          onOpenProfile={handleOpenProfile}
          onOpenPasswordModal={handleOpenPasswordModal}
          onRequestDelete={requestDelete}
          canEdit={canEdit}
          canDelete={canDelete}
          canChangePassword={canChangePassword}
        />
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Provider"
        message={
          pendingDelete
            ? `Are you sure you want to delete ${pendingDelete.first_name} ${pendingDelete.last_name}?`
            : "Are you sure you want to delete this provider?"
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={performDelete}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setPendingDelete(null);
        }}
      />

      {/* Add Provider Modal */}
      <AddProviderModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleProviderCreated}
        isAdmin={isAdmin}
      />

      {/* Provider Profile Modal */}
      <ProviderProfileModal
        open={profileModalOpen}
        provider={selectedProvider}
        currentProvider={currentProvider}
        onClose={() => setProfileModalOpen(false)}
        onUpdated={handleProviderUpdated}
        onChangePassword={(target) => handleOpenPasswordModal(target)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        targetProvider={passwordTarget}
        currentProvider={currentProvider}
      />
    </div>
  );
};

export default ProvidersList;
