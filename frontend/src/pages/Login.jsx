

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, googleLogin, reset } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const loginWithGoogle = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      const result = await dispatch(googleLogin(tokenResponse.access_token));

      if (googleLogin.fulfilled.match(result)) {
        dispatch(reset());
        navigate("/");
      }
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      dispatch(reset());
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>
      </div>
    );
  }

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"></div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-cyan-500/20 via-slate-900 to-teal-500/20 p-10 md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/30">
              {/* <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg> */}
              <img
                src={logo}
                alt="INTERVIEW BUDDY"
                className="h-16 w-16 object-contain" 
              />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Interview Buddy
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight text-white">
              Practice smarter with AI.
            </h1>

            <p className="mt-5 max-w-sm text-slate-300">
              Build confidence with coding, technical and HR mock interviews.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
              <h3 className="text-2xl font-black text-white">AI</h3>
              <p className="text-xs text-slate-400">Feedback</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
              <h3 className="text-2xl font-black text-white">HR</h3>
              <p className="text-xs text-slate-400">Round</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
              <h3 className="text-2xl font-black text-white">Code</h3>
              <p className="text-xs text-slate-400">Practice</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
              Login Page
            </p>

            <h2 className="mt-3 text-4xl font-black text-white">
              Welcome <span className="text-cyan-400">Back</span>
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Sign in to continue your interview practice.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none"
            />

            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 py-4 font-black uppercase tracking-widest text-slate-950"
            >
              Login to Account
            </button>
          </form>

          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="mx-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Social Login
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="flex justify-center rounded-2xl bg-white p-2">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full rounded-full bg-white px-6 py-3 font-bold text-slate-900"
            >
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            New here?{" "}
            <Link to="/register" className="font-bold text-cyan-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;