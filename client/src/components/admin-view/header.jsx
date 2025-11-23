// client/src/components/admin-view/header.jsx
import { Button } from "@/components/ui/button";
import { AlignJustify, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/store/authSlice/authSlice";
import { toast } from "sonner";

function AdminHeader({setOpenSidebar}) {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(state => state.auth);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error?.message || "Failed to log out. Please try again.");
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      {/* Mobile Menu Button */}
      <Button onClick={() => setOpenSidebar(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Logout Button */}
      <div className="flex flex-1 justify-end">
        <ThemeToggle className="mr-4 bg-blue-100"/>
        <Button onClick={handleLogout} variant="outline" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow bg-black text-white hover:bg-gray-200">
          <LogOut className="h-5 w-5 mr-2" />
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
