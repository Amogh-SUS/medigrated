// client/src/components/patient-view/layout.jsx
import { Outlet } from "react-router-dom";
import PatientSidebar from "./sidebar";
import PatientHeader from "./header";
import { useState } from "react";

function PatientLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <PatientSidebar open={openSidebar} setOpen={setOpenSidebar} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <PatientHeader setOpenSidebar={setOpenSidebar} />
        <main className="flex-1 flex bg-muted/40 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;
