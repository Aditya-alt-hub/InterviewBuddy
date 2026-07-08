import  { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getSessionById } from '../features/sessions/sessionSlice';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const diff = new Date(end) - new Date(start);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
};

const sanitizeQuestionText = (text) => {
    return text.replace(/^\d+[\s\.\)]+/, '').trim();
};

const formatIdealAnswer = (text) => {
    try {
        if (!text) return "Pending evaluation.";

        let cleanText = text.trim();

        // 1. Remove Markdown code blocks if the AI added them (e.g., ```json ... ```)
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        // 2. Check if it's a JSON object
        if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
            const parsed = JSON.parse(cleanText);

            // Scenario A: The "Merged" Hallucination (Fixes Screenshot 266)
            // The AI put the score object inside the answer. We extract just the answer.
            if (parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer) {
                return parsed.verbalAnswer || parsed.idealAnswer || parsed.idealanswer;
            }

            // Scenario B: Structured Explanation (Fixes Screenshot 267/268)
            const explanation = parsed.explanation || parsed.understanding || "";
            const code = parsed.code || parsed.codeExample || parsed.example || "";

            if (explanation || code) {
                return `${explanation}\n\n${code}`.trim();
            }
        }

        // Scenario C: It's just a normal string
        return text;
    } catch (e) {
        // If parsing fails, just show the raw text so nothing crashes
        return text;
    }
};

function SessionReview() {
    const { sessionId } = useParams();
    const dispatch = useDispatch();
    const { activeSession, isLoading } = useSelector(state => state.sessions);

    useEffect(() => {
        dispatch(getSessionById(sessionId));
    }, [dispatch, sessionId]);

    if (isLoading) return <div className="text-center py-20 font-bold text-slate-400 animate-pulse uppercase tracking-widest">Generating Analysis...</div>;

    if (!activeSession || activeSession.status !== 'completed') {
        return (
            <div className="max-w-xl mx-auto mt-10 sm:mt-20 p-6 sm:p-10 bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl text-center border border-slate-100 ">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4 tracking-tighter uppercase">Report Not Ready</h2>
                <p className="text-slate-500 mb-8 font-medium text-sm sm:text-base">This session is still being processed by our AI network.</p>
                <Link to="/" className="inline-block bg-teal-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition hover:bg-teal-700 active:scale-95 text-xs sm:text-sm">Dashboard</Link>
            </div>
        );
    }

    const { overallScore, metrics, role, level, questions, startTime, endTime } = activeSession;
    const finalMetrics = metrics || {};

    const barData = {
        labels: questions.map((_, i) => `Q${i + 1}`),
        datasets: [{
            label: 'Technical Score',
            data: questions.map(q => q.technicalScore || 0),
            backgroundColor: questions.map(q => (q.technicalScore || 0) > 70 ? '#10b981' : '#f59e0b'),
            borderRadius: 8,
        }],
    };

    // return (
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 animate-in fade-in duration-700">

    //         {/* --- Header --- */}
    //         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6 sm:pb-10">
    //             <div>
    //                 <span className="text-teal-600 font-black uppercase tracking-[0.2em] text-[10px]">Assessment Complete</span>
    //                 <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2 uppercase">
    //                     {role} <span className="text-slate-300 font-medium lowercase block sm:inline">({level})</span>
    //                 </h1>
    //             </div>
    //         </div>

    //         {/* --- Summary Stats --- */}
    //         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 no-scrollbar snap-x">
    //             {[
    //                 { label: 'Overall Result', value: `${overallScore}%`, color: 'teal' },
    //                 { label: 'Avg Technical', value: `${finalMetrics.avgTechnical}%`, color: 'slate' },
    //                 { label: 'Avg Confidence', value: `${finalMetrics.avgConfidence}%`, color: 'slate' },
    //                 { label: 'Session Time', value: formatDuration(startTime, endTime), color: 'slate' }
    //             ].map((stat, i) => (
    //                 <div key={i} className={`min-w-[160px] snap-center bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-sm border-l-[8px] ${stat.color === 'teal' ? 'border-teal-500' : 'border-slate-100'}`}>
    //                     <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
    //                     <p className={`text-2xl sm:text-4xl font-black mt-2 leading-none ${stat.color === 'teal' ? 'text-teal-600' : 'text-slate-800'}`}>{stat.value}</p>
    //                 </div>
    //             ))}
    //         </div>

    //         {/* --- Chart --- */}
    //         <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-sm border border-slate-50">
    //             <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Per-Question Performance</h3>
    //             <div className="h-64 sm:h-80">
    //                 <Bar
    //                     data={barData}
    //                     options={{
    //                         maintainAspectRatio: false,
    //                         plugins: { legend: { display: false } },
    //                         scales: {
    //                             y: { beginAtZero: true, max: 100, grid: { color: '#f8fafc' } },
    //                             x: { grid: { display: false } }
    //                         }
    //                     }}
    //                 />
    //             </div>
    //         </div>

    //         {/* --- Detailed Question Review --- */}
    //         <div className="space-y-6 sm:space-y-10">
    //             <h3 className="text-xl sm:text-3xl font-black text-slate-900 px-2 flex items-center tracking-tighter uppercase">
    //                 <span className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-5 text-base sm:text-xl">✓</span>
    //                 Answer Intelligence
    //             </h3>
    //             <div className="space-y-6 sm:space-y-10">
    //                 {questions.map((q, index) => (
    //                     <div key={index} className="bg-white rounded-3xl sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-500">
    //                         <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">

    //                             {/* Header: Question & Scores */}
    //                             <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
    //                                 <h4 className="text-lg sm:text-2xl font-bold text-slate-800 flex-1 leading-snug">
    //                                     <span className="text-teal-500 mr-2 font-black italic">Q{index + 1}.</span> {sanitizeQuestionText(q.questionText)}
    //                                 </h4>
    //                                 <div className="flex gap-2 shrink-0">
    //                                     <div className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl sm:rounded-2xl border flex items-center gap-2 bg-emerald-50 border-emerald-100">
    //                                         <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400">Tech</span>
    //                                         <span className="text-xs sm:text-sm font-black text-emerald-600">{q.technicalScore}%</span>
    //                                     </div>
    //                                     <div className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl sm:rounded-2xl border border-blue-50 bg-blue-50/30 flex items-center gap-2">
    //                                         <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400">Conf</span>
    //                                         <span className="text-xs sm:text-sm font-black text-blue-600">{q.confidenceScore}%</span>
    //                                     </div>
    //                                 </div>
    //                             </div>

    //                             {/* --- User's Submission Display (Corrected) --- */}
    //                             <div className="space-y-3">
    //                                 <label className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block ml-1">Your Submission</label>
    //                                 <div className="bg-slate-50 rounded-2xl sm:rounded-[2rem] border border-slate-100 overflow-hidden">

    //                                     {/* Display Code if available */}
    //                                     {q.userSubmittedCode && q.userSubmittedCode !== "undefined" && (
    //                                         <div className="p-4 sm:p-6 border-b border-slate-200 last:border-0">
    //                                             <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Code</span>
    //                                             <pre className="text-[11px] sm:text-xs font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto">
    //                                                 {q.userSubmittedCode}
    //                                             </pre>
    //                                         </div>
    //                                     )}

    //                                     {/* Display Transcript if available */}
    //                                     {q.userAnswerText && (
    //                                         <div className="p-4 sm:p-6">
    //                                             <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Transcript</span>
    //                                             <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
    //                                                 "{q.userAnswerText}"
    //                                             </p>
    //                                         </div>
    //                                     )}

    //                                     {/* Fallback if nothing was recorded */}
    //                                     {(!q.userSubmittedCode || q.userSubmittedCode === "undefined") && !q.userAnswerText && (
    //                                         <div className="p-6 text-center text-slate-400 text-xs italic">
    //                                             No answer recorded.
    //                                         </div>
    //                                     )}
    //                                 </div>
    //                             </div>

    //                             {/* Feedback & Ideal Answer Grid */}
    //                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-slate-50">
    //                                 <div className="space-y-3">
    //                                     <label className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block ml-1">AI Analytical Feedback</label>
    //                                     <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] text-xs sm:text-sm italic text-slate-600 border-l-[4px] sm:border-l-[6px] border-teal-500 leading-relaxed">
    //                                         "{q.aiFeedback}"
    //                                     </div>
    //                                 </div>
    //                                 <div className="space-y-3">
    //                                     <label className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block ml-1">Ideal Implementation</label>
    //                                     <pre className="bg-slate-900 text-slate-400 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] text-[11px] sm:text-[13px] overflow-x-auto whitespace-pre-wrap font-mono shadow-inner leading-relaxed">
    //                                         {/* Using the updated helper function here */}
    //                                         {formatIdealAnswer(q.idealAnswer)}
    //                                     </pre>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 ))}
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
  <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-white py-10 px-4">
    <div className="max-w-7xl mx-auto space-y-10">

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">

        <div className="absolute -top-32 -right-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl"></div>

        <div className="relative z-10">

          <p className="text-cyan-300 uppercase tracking-[0.35em] text-xs font-black">
            Assessment Complete
          </p>

          <h1 className="mt-3 text-5xl font-black leading-tight">
            {role}
            <span className="text-slate-400 font-medium">
              {" "}
              ({level})
            </span>
          </h1>

          <p className="mt-4 text-slate-300 max-w-3xl">
            Your interview has been evaluated by our AI engine. Explore your
            performance, strengths, weaknesses and the recommended ideal
            solutions for every question.
          </p>

        </div>

      </section>

      {/* ================= METRICS ================= */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-teal-500/10 backdrop-blur-xl p-7">

          <p className="text-xs uppercase tracking-[0.25em] font-black text-cyan-300">
            Overall Score
          </p>

          <h2 className="mt-5 text-6xl font-black text-white">
            {overallScore}%
          </h2>

          <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">

            <div
              style={{ width: `${overallScore}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full"
            />

          </div>

        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-7">

          <p className="text-xs uppercase tracking-[0.25em] font-black text-slate-400">
            Avg Technical
          </p>

          <h2 className="mt-5 text-5xl font-black text-white">
            {finalMetrics.avgTechnical}%
          </h2>

          <p className="mt-3 text-slate-400">
            Technical understanding
          </p>

        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-7">

          <p className="text-xs uppercase tracking-[0.25em] font-black text-slate-400">
            Avg Confidence
          </p>

          <h2 className="mt-5 text-5xl font-black text-white">
            {finalMetrics.avgConfidence}%
          </h2>

          <p className="mt-3 text-slate-400">
            Communication confidence
          </p>

        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-7">

          <p className="text-xs uppercase tracking-[0.25em] font-black text-slate-400">
            Session Time
          </p>

          <h2 className="mt-5 text-5xl font-black text-white">
            {formatDuration(startTime, endTime)}
          </h2>

          <p className="mt-3 text-slate-400">
            Total interview duration
          </p>

        </div>

      </section>

      {/* ================= CHART ================= */}

      <section className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-xl">

        <div className="flex items-center justify-between mb-8">

          <div>

            <p className="text-cyan-300 uppercase text-xs tracking-[0.3em] font-black">
              Analytics
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Per Question Performance
            </h2>

          </div>

          <div className="hidden md:flex gap-4 text-sm">

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Good
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              Needs Improvement
            </div>

          </div>

        </div>

        <div className="h-[350px]">

          <Bar
            data={barData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: {
                  ticks: {
                    color: "#CBD5E1",
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    color: "#CBD5E1",
                  },
                  grid: {
                    color: "rgba(255,255,255,.08)",
                  },
                },
              },
            }}
          />

        </div>

      </section>

      {/* ================= ANSWER INTELLIGENCE ================= */}

      <section className="space-y-8">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-2xl">
            🧠
          </div>

          <div>

            <p className="text-cyan-300 uppercase tracking-[0.3em] text-xs font-black">
              Detailed Analysis
            </p>

            <h2 className="text-3xl font-black">
              Answer Intelligence
            </h2>

          </div>

        </div>

        <div className="space-y-8">

          {questions.map((q, index) => (
                        <div
              key={index}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl shadow-xl transition hover:border-cyan-400/30"
            >
              <div className="p-6 sm:p-8 space-y-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <h3 className="flex-1 text-xl sm:text-2xl font-black leading-snug text-white">
                    <span className="mr-2 text-cyan-400 italic">
                      Q{index + 1}.
                    </span>
                    {sanitizeQuestionText(q.questionText)}
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tech
                      </span>
                      <span className="ml-2 text-sm font-black text-emerald-300">
                        {q.technicalScore}%
                      </span>
                    </div>

                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Conf
                      </span>
                      <span className="ml-2 text-sm font-black text-cyan-300">
                        {q.confidenceScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Your Submission
                  </label>

                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/70">
                    {q.userSubmittedCode &&
                      q.userSubmittedCode !== "undefined" && (
                        <div className="border-b border-white/10 p-5">
                          <span className="mb-3 block text-[10px] font-black uppercase tracking-widest text-cyan-300">
                            Code
                          </span>

                          <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-200">
                            {q.userSubmittedCode}
                          </pre>
                        </div>
                      )}

                    {q.userAnswerText && (
                      <div className="p-5">
                        <span className="mb-3 block text-[10px] font-black uppercase tracking-widest text-cyan-300">
                          Transcript
                        </span>

                        <p className="text-sm italic leading-relaxed text-slate-300">
                          "{q.userAnswerText}"
                        </p>
                      </div>
                    )}

                    {(!q.userSubmittedCode ||
                      q.userSubmittedCode === "undefined") &&
                      !q.userAnswerText && (
                        <div className="p-6 text-center text-sm italic text-slate-500">
                          No answer recorded.
                        </div>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-7 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      AI Analytical Feedback
                    </label>

                    {/* <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm italic leading-relaxed text-emerald-100">
                      "{q.aiFeedback}"
                    </div> */}
                    <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm italic leading-relaxed text-emerald-100">
                      {q.AIFeedback || q.aiFeedback || "No AI feedback available."}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Ideal Implementation
                    </label>

                    <pre className="max-h-[420px] overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] border border-white/10 bg-slate-950 p-5 font-mono text-xs leading-relaxed text-slate-200 shadow-inner">
                      {formatIdealAnswer(q.idealAnswer)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </main>
);
}

export default SessionReview;