// client/src/components/admin-view/sidebar.jsx
import { BotMessageSquare, ChartNoAxesCombined, ClipboardPlus, LayoutDashboard, MapPin, Menu, ScrollText, Settings, Users } from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSidebarMenuItems = [
  { id : 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon:<LayoutDashboard /> },
  { id : 'users', label: 'Manage Users', path: '/admin/users', icon:<Users /> },
  { id : 'reports', label: 'Manage Reports', path: '/admin/reports', icon:<ClipboardPlus /> },
  { id : 'locations', label: 'Manage Locations', path: '/admin/locations', icon:<MapPin /> },
  { id : 'chatbot', label: 'Chatbot Insights', path: '/admin/chatbot', icon:<BotMessageSquare /> },
  { id : 'logs', label: 'System Logs', path: '/admin/logs', icon:<ScrollText /> },
  { id : 'settings', label: 'Manage Settings', path: '/admin/settings', icon:<Settings /> },
];

function MenuItems({setOpen}) {

    const navigate = useNavigate();
    
    return <nav className="mt-8 flex-col flex gap-2">
        {
            adminSidebarMenuItems.map(menuItem => <div key={menuItem.id} 
                onClick={() => {
                    navigate(menuItem.path);
                    setOpen ? setOpen(false) : null;
                }}
             className="flex items-center text-xl gap-2 rounded-md px-3 py-2 text-muted-foreground  hover:bg-muted hover:text-foreground cursor-pointer">
                {menuItem.icon}
                <span className="font-medium">{menuItem.label}</span>
            </div>)
        }
    </nav>
}

function AdminSidebar({open, setOpen}) {

    const navigate = useNavigate();
    

    return (
    <Fragment>
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left"  className="w-64 pt-2 pr-2 [&>button]:top-2 [&>button]:right-2 [&>button]:scale-75 [&>button]:bg-gray-200 [&>button]:hover:bg-gray-300">
                <div className="flex flex-col h-full">
                    <SheetHeader className='border-b'>
                        <SheetTitle className="flex items-center gap-2 mt-6 mb-4 text-xl font-extrabold">
                            <ChartNoAxesCombined size={30} />
                            <span>Admin Panel</span>
                        </SheetTitle>
                    </SheetHeader>
                    <MenuItems setOpen={setOpen} />
                </div>
            </SheetContent>
        </Sheet>
        <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
            <div onClick={()=>navigate('/admin/dashboard')} className="flex cursor-pointer items-center gap-2">
                <ChartNoAxesCombined size={30} />
                <h1 className="text-2xl font-extrabold">Admin Panel</h1>
            </div>
            <MenuItems />
        </aside>
    </Fragment>
    );
}

export default AdminSidebar;
