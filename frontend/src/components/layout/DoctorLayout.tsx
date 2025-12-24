// frontend/src/components/layout/DoctorLayout.tsx

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { useCurrentProvider } from "../../features/providers/hooks/useCurrentProvider";
import ViewProviderModal from "../../features/providers/components/modals/ViewProviderModal";
import ChangePasswordModal from "../../features/providers/components/modals/ChangePasswordModal";
import EditProviderModal from "../../features/providers/components/modals/EditProviderModal";
import { Provider } from "../../features/providers/services/providersApi";

type DoctorLayoutProps = {
  onLogout: () => void;
};

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ onLogout }) => {
  const { provider: currentProvider } = useCurrentProvider();

  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [changePasswordTarget, setChangePasswordTarget] =
    useState<Provider | null>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Top navigation bar */}
      <TopNavbar
        onLogout={onLogout}
        onOpenProfile={() => setViewProfileOpen(true)}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-4 overflow-y-auto bg-bg dark:bg-bg-dark">
          <Outlet />
        </div>
      </div>

      {/* View Provider Profile */}
      <ViewProviderModal
        open={viewProfileOpen}
        provider={currentProvider}
        currentProvider={currentProvider}
        onClose={() => setViewProfileOpen(false)}
        onEdit={(provider) => {
          setViewProfileOpen(false);
          setEditingProvider(provider);
        }}
        onChangePassword={(provider) => {
          setViewProfileOpen(false);
          setChangePasswordTarget(provider);
        }}
      />

      {/* Edit Provider */}
      <EditProviderModal
        open={!!editingProvider}
        provider={editingProvider}
        onClose={() => setEditingProvider(null)}
        onUpdated={() => {
          // optional: refetch provider later if desired
        }}
      />

      {/* Change Password */}
      <ChangePasswordModal
        open={!!changePasswordTarget}
        targetProvider={changePasswordTarget}
        currentProvider={currentProvider}
        onClose={() => setChangePasswordTarget(null)}
      />
    </div>
  );
};

export default DoctorLayout;
