import SharedForm from "@/components/shared/form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { loginFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/authSlice/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);


  function onSubmit(e) {
    e.preventDefault();
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success(data.payload.message || "Login successful!");
        
        //navigate based on role
        const role = data.payload.user.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        toast.error(data?.payload?.message || "Login failed!");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium text-primary ml-2 hover:underline"
            to="/auth/register"
          >
            Sign up
          </Link>
        </p>
      </div>

      <SharedForm
        formControls={loginFormControls}
        buttonText={isLoading ? "Logging in..." : "Log In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthLogin;
