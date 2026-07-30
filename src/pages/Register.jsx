import {ArrowRight,ChevronDown,Droplets,Eye,Globe,Heart,HeartPulse,Hospital,Lock,Mail,Quote,User,Users} from "lucide-react";
import { useState } from "react";
import { registerApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
   const navigate=useNavigate();
   const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});


  //* when input is change this function is called
  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
};


  //* validation object 

  const validationConfig={
    username:[{required:true,message:"username is required"}],
    email:[{required:true,message:"email is required"},{pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:"email is not valid"}],
    password:[{required:true,message:"password is required"},{min:4,"message":"Password must be at least 4 characters long"}]
  }

//* validation function

const validate=(formData)=>{
  const errorData={};
  Object.entries(formData).forEach(([key,value])=>{
    validationConfig[key].some((rule)=>{
      if (rule.required && !value){
        errorData[key]=rule.message;
        return
      }

      if (rule.pattern && !rule.pattern.test(value)){
        errorData[key]=rule.message
        return 
      }

      if (rule.min && value.length<rule.min){
        errorData[key]=rule.message
        return
      }
    })
  })

  setErrors(errorData);
  return errorData;
}

  const handleSubmit=async (e)=>{
   e.preventDefault();
   console.log("form handle submit function is running");
   const validationResult=validate(formData);
   console.log(validationResult);
   if(Object.keys(validationResult).length) return;
   //* if there is no validation then i will call backend api
   try{
    await registerApi(formData);
    navigate("/login");
   }catch(err){
    console.log(err.message);
    if (err.status === 409) {
      setErrors({
        email: err.message,
      });
    }
   }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <div className="min-h-screen w-full overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[1100px] items-center justify-center p-2 sm:p-3 lg:p-4">
          <div className="grid w-full grid-cols-1 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_16px_60px_rgba(0,0,0,0.08)] lg:grid-cols-2">
            <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,oklch(0.99_0.01_17.38),oklch(0.97_0.02_17.38)_45%,oklch(0.995_0.005_17.38))] p-4 sm:p-5">
              <div className="blur-2xl rounded-full bg-[#fb2c36]/10 absolute left-10 top-10 w-24 h-24" />
              <div className="blur-xl rounded-full bg-[#fb2c36]/10 absolute right-16 top-14 w-16 h-16" />
              <div className="blur-3xl rounded-full bg-[#fb2c36]/5 absolute right-0 bottom-0 w-40 h-40" />
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
                    Join the Community
                    <span className="block text-[#fb2c36]">
                      That Saves Lives.
                    </span>
                  </h1>
                  <p className="max-w-[320px] text-sm leading-6 text-[#71717b]">
                    Create your BloodConnect account and become part of a
                    trusted network of blood donors and recipients.
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
                      Every account brings hope to someone in need.
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
                    <HeartPulse className="size-6" />
                  </div>
                  <h2 className="mt-3 text-2xl font-bold leading-8 tracking-tight text-zinc-950">
                    Create Your Account
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#71717b]">
                    Create your BloodConnect account in less than a minute.
                  </p>
                </div>
                <form className="mt-3 space-y-2" onSubmit={(e)=>{handleSubmit(e)}}>
                  <div className="space-y-2 relative mb-[0.8rem]">
                    <label htmlFor="fullName" className="font-medium text-[#fb2c36] text-sm leading-5">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                      <User className="size-4 text-[#71717b]" />
                      <input
                        id="username"
                        name="username"
                        value={formData.username}
                        type="text"
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="flex-1 bg-transparent text-sm leading-5 text-zinc-950 placeholder:text-[#71717b] outline-none"
                      />
                    </div>
                     <p className="absolute  top-16 left-1 text-green-700  text-[10px]">{errors.username}</p>
                  </div>
                  <div className="space-y-2 relative mb-[0.8rem]">
                    <label htmlFor="email" className="font-medium text-[#fb2c36] text-sm leading-5">
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
                        className="flex-1 bg-transparent text-sm leading-5 text-zinc-950 placeholder:text-[#71717b] outline-none"
                      />
                    </div>
                    <p className="absolute  top-16 left-1 text-green-700  text-[10px]">{errors.email}</p>
                  </div>
                  <div className="space-y-2 relative mb-[0.8rem]">
                    <label htmlFor="password" className="font-medium text-[#fb2c36] text-sm leading-5">
                      Password
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                      <Lock className="size-4 text-[#71717b]" />
                      <input
                        id="password"
                        name="password"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="flex-1 bg-transparent text-sm leading-5 text-zinc-950 placeholder:text-[#71717b] outline-none"
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
                     <p className="absolute  top-16 left-1 text-green-700  text-[10px]">{errors.password}</p>
                  </div>

                  <button type="submit" className="flex mt-5 cursor-pointer w-full items-center justify-center gap-2 rounded-xl bg-[#fb2c36] px-4 py-2.5 text-sm font-semibold leading-5 text-red-50 shadow-lg shadow-primary/20 transition">
                    Create Account
                    <ArrowRight className="size-5" />
                  </button>
                  <div className="flex items-center gap-3 py-1">
                    <div className="bg-zinc-200 flex-1 h-px" />
                    <span className="font-medium text-[#71717b] text-xs leading-4 tracking-[3.2px]">
                      OR
                    </span>
                    <div className="bg-zinc-200 flex-1 h-px" />
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium leading-5 text-zinc-950 shadow-sm transition">
                    <svg
                      className="size-4 text-[#fb2c36]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.99-4.33 2.99-7.53Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H2.98v2.58A10 10 0 0 0 12 22Z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.41 13.91A6.02 6.02 0 0 1 6.41 10.1V7.52H2.98a10 10 0 0 0 0 12.78l3.43-2.58Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 6.04c1.47 0 2.8.5 3.84 1.49l2.88-2.88C16.96 2.99 14.7 2 12 2A10 10 0 0 0 2.98 7.52l3.43 2.58C7.2 7.8 9.4 6.04 12 6.04Z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>
                  <p className="text-center text-sm leading-5 text-[#71717b]">
                    Already have an account?
                    <span onClick={()=>{navigate("/login")}} className="cursor-pointer font-semibold text-[#fb2c36]">
                      Sign In
                    </span>
                  </p>
                </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      
    </div>
  );
}


