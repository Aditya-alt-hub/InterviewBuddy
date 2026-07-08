

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    setIsMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative text-sm font-extrabold uppercase tracking-[0.18em] transition-all duration-300 ${
      isActive(path)
        ? "text-cyan-300"
        : "text-slate-400 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-400/10 bg-slate-950/80 backdrop-blur-2xl shadow-lg shadow-cyan-950/20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* <Link to="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-cyan-400 blur-md opacity-40 group-hover:opacity-70 transition"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 shadow-xl">
              <svg
                className="h-7 w-7"
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
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              AI <span className="text-cyan-400">Interviewer</span>
            </h1>
            <p className="hidden text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 sm:block">
              Interview Buddy
            </p>
          </div>
        </Link> */}

        <Link to="/" className="group flex items-center  gap-4">
          <img
            src={logo}
            alt="Interview Buddy"
            className="h-20 w-20 object-contain transition duration-300 group-hover:scale-110"
          />

          <div>
           <h1 className="text-2xl font-black tracking-tight text-white">
            <span className="text-cyan-400">INTERVIEW</span>{" "}
            <span className="text-white">BUDDY</span>
           </h1>

           <p className="text-[10px] uppercase tracking-[0.45em] text-slate-400">
            AI MOCK INTERVIEW PLATFORM
           </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {user ? (
            <>
              <Link to="/" className={navLinkClass("/")}>
                Dashboard
                {isActive("/") && (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-cyan-400"></span>
                )}
              </Link>

              <Link to="/profile" className={navLinkClass("/profile")}>
                Profile
                {isActive("/profile") && (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-cyan-400"></span>
                )}
              </Link>

              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-sm font-black text-slate-950">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  {user.name?.split(" ")[0]}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="rounded-2xl bg-rose-500/90 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClass("/login")}>
                Login
                {isActive("/login") && (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-cyan-400"></span>
                )}
              </Link>

              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-105 active:scale-95"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-cyan-400 md:hidden"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-6 py-6 backdrop-blur-xl md:hidden">
          {user ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Logged in as
                </p>
                <p className="mt-1 text-lg font-black">{user.name}</p>
              </div>

              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-2xl px-4 py-4 text-lg font-black uppercase tracking-widest ${
                  isActive("/") ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-2xl px-4 py-4 text-lg font-black uppercase tracking-widest ${
                  isActive("/profile") ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400"
                }`}
              >
                Profile
              </Link>

              <button
                onClick={onLogout}
                className="w-full rounded-2xl bg-rose-600 py-4 font-black uppercase tracking-widest text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-2xl px-4 py-4 text-lg font-black uppercase tracking-widest ${
                  isActive("/login") ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400"
                }`}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 px-4 py-4 text-center text-lg font-black uppercase tracking-widest text-slate-950"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;