import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Droplets, Heart, HeartPulse, Hospital, Mail, Quote, Send, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../api/authApi";

export const ForgotPassPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setResendSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [resendSeconds]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (resendSeconds > 0) {
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSending(true);
      setError("");
      setMessage("");
      const data = await forgotPasswordApi({ email });
      setMessage(data.message || "Password reset link sent to your email.");
      setResendSeconds(30);
    } catch (err) {
      setError(err.message || "Unable to send reset link.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <div className="min-h-screen w-full overflow-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[1100px] items-center justify-center p-2 sm:p-3 lg:p-4">
          <div className="grid w-full grid-cols-1 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_16px_60px_rgba(0,0,0,0.08)] lg:grid-cols-2">
            <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,oklch(0.99_0.01_17.38),oklch(0.97_0.02_17.38)_45%,oklch(0.995_0.005_17.38))] p-4 sm:p-5">
              <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-[#fb2c36]/10 blur-2xl" />
              <div className="absolute right-16 top-14 h-16 w-16 rounded-full bg-[#fb2c36]/10 blur-xl" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#fb2c36]/5 blur-3xl" />
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
                    Recover Access
                    <span className="block text-[#fb2c36]">
                      Keep Saving Lives.
                    </span>
                  </h1>
                  <p className="max-w-[320px] text-sm leading-6 text-[#71717b]">
                    Reset your BloodConnect password and get back to managing requests, donors, and urgent support.
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
                    <div className="mt-1.5 text-[13px] font-bold leading-5 tracking-tight">50K+</div>
                    <div className="text-[10px] leading-4 text-[#71717b]">Registered Users</div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 text-center shadow-sm">
                    <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                      <Droplets className="size-3.5" />
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold leading-5 tracking-tight">10K+</div>
                    <div className="text-[10px] leading-4 text-[#71717b]">Lives Saved</div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 text-center shadow-sm">
                    <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                      <Hospital className="size-3.5" />
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold leading-5 tracking-tight">250+</div>
                    <div className="text-[10px] leading-4 text-[#71717b]">Partner Hospitals</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Quote className="size-4 text-[#fb2c36]" />
                    <p className="text-xs leading-5 text-[#71717b]">
                      A secure account keeps every request moving faster.
                    </p>
                  </div>
                  <Heart className="size-4 text-[#fb2c36]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center bg-white p-3 sm:p-4 lg:p-5">
              <div className="w-full max-w-[500px] rounded-[28px] border border-zinc-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-[#71717b] transition hover:text-[#fb2c36]"
                >
                  <ArrowLeft className="size-4" />
                  Back to Login
                </Link>

                <div className="mt-9 flex flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#fb2c36]/10 text-[#fb2c36]">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h2 className="mt-5 text-3xl font-bold leading-9 tracking-tight text-zinc-950">
                    Forgot Password
                  </h2>
                  <p className="mt-3 max-w-[400px] text-base leading-7 text-[#71717b]">
                    Enter your registered email address and we'll send you a password reset link.
                  </p>
                </div>

                <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
                  {message ? (
                    <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                      {message}
                    </p>
                  ) : null}

                  {error ? (
                    <p className="rounded-xl bg-[#fb2c36]/10 px-3 py-2 text-center text-xs font-medium text-[#fb2c36]">
                      {error}
                    </p>
                  ) : null}

                  <div className="relative space-y-2.5">
                    <label htmlFor="email" className="text-sm font-medium leading-5 text-[#fb2c36]">
                      Email
                    </label>
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4">
                      <Mail className="size-5 text-[#71717b]" />
                      <input
                        id="email"
                        name="email"
                        value={email}
                        type="email"
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError("");
                          setMessage("");
                        }}
                        placeholder="Enter your email address"
                        className="flex-1 bg-transparent text-base leading-6 text-zinc-950 outline-none placeholder:text-[#71717b]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || resendSeconds > 0}
                    className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#fb2c36] px-4 text-base font-semibold leading-6 text-red-50 shadow-lg shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending
                      ? "Sending..."
                      : resendSeconds > 0
                        ? `Resend Link in ${resendSeconds}s`
                        : message
                          ? "Send Reset Link Again"
                          : "Send Reset Link"}
                    {isSending ? <Send className="size-5" /> : <ArrowRight className="size-5" />}
                  </button>

                  {resendSeconds > 0 ? (
                    <p className="text-center text-xs font-semibold text-[#71717b]">
                      You can request another reset link after {resendSeconds} seconds.
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassPage;
