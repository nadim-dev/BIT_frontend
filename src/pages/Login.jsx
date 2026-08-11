import { useState } from "react";
import {ArrowRight,Droplets,Eye,Heart,HeartPulse,Hospital,Lock,LogIn,Mail,Quote,Truck,Users,X} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "../utils/dashboardRoutes";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../api/authApi";
import { Link } from "react-router-dom";


export function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "billu123@gmail.com",
    password: "nad@1234",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
      form: "",
    });
  };

  const validationConfig = {
    email: [
      { required: true, message: "email is required" },
      {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "email is not valid",
      },
    ],
    password: [{ required: true, message: "password is required" }],
  };

  const validate = (formData) => {
    const errorData = {};

    Object.entries(formData).forEach(([key, value]) => {
      validationConfig[key].some((rule) => {
        if (rule.required && !value) {
          errorData[key] = rule.message;
          return true;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          errorData[key] = rule.message;
          return true;
        }

        return false;
      });
    });

    setErrors(errorData);
    return errorData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationResult = validate(formData);
    if (Object.keys(validationResult).length) return;

    try {
      const data = await loginApi(formData);
      const currentUser = data.currentUser;
      setCurrentUser(currentUser);
      navigate(getDashboardPath(currentUser?.role));
    } catch (err) {
      console.log(err.message);
      setErrors({
        form: err.message,
      });
    }
  };

  const partnerOptions = [
    {
      label: "Register Blood Bank",
      actionUrl: "/register/blood-bank",
      icon: Droplets,
    },
    {
      label: "Register Hospital",
      actionUrl: "/register/hospital",
      icon: Hospital,
    },
    {
      label: "Register Delivery Partner",
      actionUrl: "/register/delivery-partner",
      icon: Truck,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <div className="min-h-screen w-full overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[1100px] items-center justify-center p-2 sm:p-3 lg:p-4">
          <div className="grid w-full grid-cols-1 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_16px_60px_rgba(0,0,0,0.08)] lg:grid-cols-2">
            <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,oklch(0.99_0.01_17.38),oklch(0.97_0.02_17.38)_45%,oklch(0.995_0.005_17.38))] p-4 sm:p-5">
              <div className="blur-2xl rounded-full bg-[#fb2c36]/10 absolute left-10 top-10 h-24 w-24" />
              <div className="blur-xl rounded-full bg-[#fb2c36]/10 absolute right-16 top-14 h-16 w-16" />
              <div className="blur-3xl rounded-full bg-[#fb2c36]/5 absolute bottom-0 right-0 h-40 w-40" />
              <div className="relative flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-[#fb2c36] text-red-50 shadow-lg shadow-primary/20">
                  <HeartPulse className="size-5" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-6 tracking-tight text-zinc-950">
                    BloodConnect
                  </div>
                  <div className="text-sm leading-5 text-[#71717b]">
                    Saving Lives Together
                  </div>
                </div>
              </div>
              <div className="relative mt-4 max-w-[390px]">
                <div className="space-y-4">
                  <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-zinc-950 sm:text-4xl">
                    Welcome Back
                    <span className="block text-[#fb2c36]">
                      Ready to Save Lives.
                    </span>
                  </h1>
                  <p className="max-w-[320px] text-sm leading-6 text-[#71717b]">
                    Sign in to manage requests, connect with donors, and keep
                    your BloodConnect account active.
                  </p>
                </div>
                <div className="relative mt-3 overflow-hidden rounded-[22px] border border-zinc-200 bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                  <img
                    alt="Blood donation illustration"
                    className="h-56 w-full rounded-[18px] object-cover"
                    src="./src/assets/blood.png"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 text-center shadow-sm">
                    <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                      <Users className="size-3.5" />
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold leading-5 tracking-tight">
                      50K+
                    </div>
                    <div className="text-[10px] leading-4 text-[#71717b]">
                      Registered Users
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 text-center shadow-sm">
                    <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                      <Droplets className="size-3.5" />
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold leading-5 tracking-tight">
                      10K+
                    </div>
                    <div className="text-[10px] leading-4 text-[#71717b]">
                      Lives Saved
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 text-center shadow-sm">
                    <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                      <Hospital className="size-3.5" />
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold leading-5 tracking-tight">
                      250+
                    </div>
                    <div className="text-[10px] leading-4 text-[#71717b]">
                      Partner Hospitals
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Quote className="size-4 text-[#fb2c36]" />
                    <p className="text-xs leading-5 text-[#71717b]">
                      Your next sign in could help someone find hope faster.
                    </p>
                  </div>
                  <Heart className="size-4 text-[#fb2c36]" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center bg-white p-3 sm:p-4 lg:p-5">
              <div className="w-full max-w-[440px] rounded-[24px] border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-5">
            
                <div className="mt-3 flex flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                    <LogIn className="size-6" />
                  </div>
                  <h2 className="mt-3 text-2xl font-bold leading-8 tracking-tight text-zinc-950">
                    Sign In
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#71717b]">
                    Access your BloodConnect account.
                  </p>
                </div>
                <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
                  {errors.form && (
                    <p className="rounded-xl bg-[#fb2c36]/10 px-3 py-2 text-center text-xs font-medium text-[#fb2c36]">
                      {errors.form}
                    </p>
                  )}
                  <div className="relative mb-[0.8rem] space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-5 text-[#fb2c36]"
                    >
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                      <Mail className="size-4 text-[#71717b]" />
                      <input
                        id="email"
                        name="email"
                        value={formData.email}
                        type="email"
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="flex-1 bg-transparent text-sm leading-5 text-zinc-950 outline-none placeholder:text-[#71717b]"
                      />
                    </div>
                    <p className="absolute left-1 top-16 text-[10px] text-green-700">
                      {errors.email}
                    </p>
                  </div>
                  <div className="relative mb-[0.8rem] space-y-2 ">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium leading-5 text-[#fb2c36]"
                    >
                      Password
                    </label>
                    <div className="flex items-center mb-[0.4rem] gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                      <Lock className="size-4 text-[#71717b]" />
                      <input
                        id="password"
                        name="password"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="flex-1 bg-transparent text-sm leading-5 text-zinc-950 outline-none placeholder:text-[#71717b]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="cursor-pointer text-[#71717b] transition hover:text-[#fb2c36]"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                    <p className="absolute left-1 top-16 text-[10px] text-green-700">
                      {errors.password}
                    </p>
                    <Link to="/forgot-password" className="text-[12px] text-blue-700 hover:underline">
                        Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fb2c36] px-4 py-2.5 text-sm font-semibold leading-5 text-red-50 shadow-lg shadow-primary/20 transition"
                  >
                    Sign In
                    <ArrowRight className="size-5" />
                  </button>
                </form>
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <span className="text-xs font-medium leading-4 tracking-[3.2px] text-[#71717b]">
                      OR
                    </span>
                    <div className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        try{  
                        const data=await loginWithGoogle(credentialResponse.credential);
                        const currentUser = data.currentUser;
                        setCurrentUser(currentUser);
                        navigate(getDashboardPath(currentUser?.role))
                      }catch(err){
                        setErrors({
                          form: err.message,
                        });
                      }
                      }}
                      onError={() => {
                        setErrors({
                          form: "Login with Google failed",
                        });
                      }}
                    />
                  <p className="text-center text-sm leading-5 text-[#71717b]">
                    Don't have an account?
                    <span
                      onClick={() => navigate("/register")}
                      className="cursor-pointer font-semibold text-[#fb2c36]"
                    >
                      {" "}
                      Create one
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsPartnerMenuOpen(true)}
                    className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-[#fb2c36] transition hover:border-red-200 hover:bg-red-100"
                  >
                    Become a Partner
                    <ArrowRight className="size-4" />
                  </button>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPartnerMenuOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 px-4">
          <div className="w-full max-w-[430px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[2.4px] text-[#fb2c36]">
                  Become a Partner
                </p>
                <h3 className="mt-1 text-xl font-extrabold leading-7 text-zinc-950">
                  Choose Partner Type
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerMenuOpen(false)}
                aria-label="Close partner options"
                className="grid size-9 cursor-pointer place-items-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-[#fb2c36]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {partnerOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <Link
                    key={option.actionUrl}
                    to={option.actionUrl}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-left transition hover:border-red-200 hover:bg-red-50"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-sm font-extrabold text-zinc-900">
                        {option.label}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-[#fb2c36]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Login;
