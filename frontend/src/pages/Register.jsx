


import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { name, email, password, password2 } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess) {
      toast.success("User Registered Successfully");
      navigate("/");
      dispatch(reset());
    }

    if (user && !isSuccess) {
      navigate("/");
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }

    dispatch(
      register({
        name,
        email,
        password,
      })
    );
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
      <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-teal-500/20 blur-3xl"></div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
              INTERVIEW BUDDY
            </p>

            <h1 className="mt-3 text-4xl font-black text-white">
              Get <span className="text-cyan-400">Started</span>
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Create your account and start practicing with AI.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={name}
                placeholder="Enter your full name"
                onChange={onChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={onChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={password}
                  placeholder="Password"
                  onChange={onChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                  Confirm
                </label>

                <input
                  type="password"
                  name="password2"
                  value={password2}
                  placeholder="Confirm"
                  onChange={onChange}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 py-4 font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Create My Account
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-cyan-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <div className="hidden bg-gradient-to-br from-teal-500/20 via-slate-900 to-cyan-500/20 p-10 md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/30">
              {/* <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg> */}
              <img
                              src={logo}
                              alt="INTERVIEW BUDDY"
                              className="h-16 w-16 object-contain" 
                            />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Start Your Journey
            </p>

            <h2 className="mt-4 text-5xl font-black leading-tight text-white">
              Your AI interview Buddy is ready.
            </h2>

            <p className="mt-5 max-w-sm text-slate-300">
              Practice coding, technical and HR rounds with instant feedback.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <h3 className="font-black text-white">Smart Question Generation</h3>
              <p className="mt-1 text-sm text-slate-400">
                Get role-based interview questions.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <h3 className="font-black text-white">Real-time Evaluation</h3>
              <p className="mt-1 text-sm text-slate-400">
                Improve with AI-powered feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;

