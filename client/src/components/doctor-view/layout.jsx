//client/src/components/doctor-view/layout.jsx

import React from "react"
import { Outlet } from "react-router-dom"
import DoctorSidebar from "./sidebar"
import DoctorHeader from "./header"
import { useState } from "react"

function DoctorLayout () {

    const [openSidebar, setOpenSidebar] = useState(false);
    return (
        <div className="flex min-h-screen w-full">
            {/*sidebar*/}
            <DoctorSidebar open={openSidebar} setOpen={setOpenSidebar} />
            <div className="flex flex-1 flex-col">
                {/*header*/}
                <DoctorHeader setOpenSidebar={setOpenSidebar} />
                <main className="flex-1 flex bg-muted/40 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

        </div>
    )
}

export default DoctorLayout