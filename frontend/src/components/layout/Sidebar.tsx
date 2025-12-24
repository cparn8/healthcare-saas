import React from "react";
import { NavLink } from "react-router-dom";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import FileText from "lucide-react/dist/esm/icons/file-text";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-56 bg-side dark:bg-side-dark h-screen pt-6 flex flex-col">
      {/* App Name */}
      <div className="px-4 mb-6 text-lg font-bold text-text-primary dark:text-text-darkPrimary">
        HealthCapstone
      </div>

      {/* Core */}
      <div className="px-4 mb-2 text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase">
        Core
      </div>

      <NavLink
        to="/doctor/schedule"
        className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2 text-text-primary dark:text-text-darkPrimary
 hover:bg-primary-lighter hover:dark:bg-primary-dlighter hover:text-primary-hover hover:dark:text-primary-ddarker ${
   isActive
     ? "font-semibold text-primary-hover dark:text-text-primary border-l-4 border-blue-700 bg-primary-lighter dark:bg-primary-dlighter"
     : ""
 }`
        }
      >
        <Calendar className="h-4 w-4" />
        Schedule
      </NavLink>

      {/* Clinical */}
      <div className="px-4 mt-6 mb-2 text-xs font-semibold text-text-secondary dark:text-text-darkSecondary uppercase">
        Clinical
      </div>

      <div className="flex items-center gap-2 px-4 py-2 text-text-muted dark:text-text-darkMuted cursor-not-allowed">
        <FileText className="h-4 w-4" />
        Charts
        <span className="ml-auto text-xs italic">Soon</span>
      </div>

      {/* Footer spacer */}
      <div className="flex-1" />

      <div className="px-4 py-4 text-xs text-text-muted dark:text-text-darkMuted">
        © HealthCapstone
      </div>
    </aside>
  );
};

export default Sidebar;
