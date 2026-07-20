

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createSession,
  getSessions,
  reset,
  deleteSession,
} from "../features/sessions/sessionSlice";
import { toast } from "react-toastify";
import SessionCard from "../components/SessionCard";

const ROLES = [
  "MERN Stack Developer",
  "DATA Structures and Algorithms",
  "Full Stack Python",
  "Full Stack Java",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer (AWS/Azure/GCP)",
  "Cybersecurity Engineer",
  "Blockchain Developer",
  "Mobile Developer (iOS/Android)",
  "Game Developer",
  "UI/UX Designer",
  "QA Automation Engineer",
  "Product Manager",
];

const LEVELS = ["Junior", "Mid-Level", "Senior"];
const TYPES = [
  { label: "Coding", value: "coding" },
  { label: "Technical", value: "Technical" },
  { label: "HR", value: "HR" },
];
const COUNTS = [5, 10, 15];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { sessions, isLoading, isGenerating, isError, message } = useSelector(
    (state) => state.sessions
  );

  const isProcessing = isGenerating;

  const [formData, setFormData] = useState({
    role: user?.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    dispatch(getSessions());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
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

    try {
      const result = await dispatch(createSession(formData)).unwrap();

      toast.success("Interview session created.");
      navigate(`/interview/${result.sessionId}`);
      dispatch(getSessions());
    } catch (err) {
      toast.error(err || "Failed to create session.");
    }
  };

  const viewSession = (session) => {
    if (session.status === "completed") {
      navigate(`/review/${session._id}`);
    } else if (session.status === "in-progress") {
      navigate(`/interview/${session._id}`);
    } else {
      toast.info("Session not ready yet");
    }
  };

  const handleDelete = (sessionId) => {
    dispatch(deleteSession(sessionId));
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
          <div className="absolute bottom-[-80px] left-[-80px] h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"></div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Interview 
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                Welcome,{" "}
                <span className="text-cyan-400">
                  {user?.name ? user.name.split(" ")[0] : "User"}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-lg">
                Create a mock interview session and practice coding, technical,
                or HR rounds with AI.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Sessions
                </p>
                <p className="mt-2 text-3xl font-black text-cyan-300">
                  {sessions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Level
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {formData.level}
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 sm:col-span-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Mode
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {formData.interviewType}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-slate-900/70 px-6 py-5 sm:px-8">
            <h2 className="flex items-center text-xl font-black text-white">
              <span className="mr-3 h-6 w-1.5 rounded-full bg-cyan-400"></span>
              New Interview
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose your role, level, interview type and number of questions.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 gap-5 p-6 sm:p-8 md:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm font-bold text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-900">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm font-bold text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level} className="bg-slate-900">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Length
              </label>
              <select
                name="count"
                value={formData.count}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm font-bold text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              >
                {COUNTS.map((count) => (
                  <option key={count} value={count} className="bg-slate-900">
                    {count} Qs
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={onChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm font-bold text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              >
                {TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                    className="bg-slate-900"
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`md:col-span-2 lg:col-span-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest transition active:scale-[0.98] ${
                isProcessing
                  ? "cursor-not-allowed bg-slate-700 text-slate-400"
                  : "bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.01]"
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                  Generating...
                </>
              ) : (
                "Start Interview"
              )}
            </button>
          </form>
        </section>

        <section className="space-y-6 pb-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Analytics
              </p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Interview History
              </h2>
            </div>
          </div>

          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 py-20 backdrop-blur-xl">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                
              </div>
              <p className="text-lg font-black text-white">No sessions yet.</p>
              <p className="mt-2 text-sm text-slate-400">
                Start your first interview from the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onClick={viewSession}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;