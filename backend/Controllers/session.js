


import Session from "../models/session.js";
import asyncHandler from "express-async-handler";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import mongoose from "mongoose";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const pushSocketUpdate = (io, userId, sessionId, status, message, sessionData = null) => {
  io.to(userId.toString()).emit("sessionUpdate", {
    sessionId,
    status,
    message,
    sessionData,
  });
};

const createSession = asyncHandler(async (req, res) => {
  const { role, level, interviewType, count } = req.body;
  const userId = req.user._id;

  if (!role || !level || !interviewType || !count) {
    return res.status(400).json({
      success: false,
      message: "Please provide role, level, interview type and question count",
    });
  }

  const session = await Session.create({
    user: userId,
    role,
    level,
    interviewType,
    status: "pending",
  });

  const io = req.app.get("io");

  res.status(201).json({
    success: true,
    message: "Session created successfully",
    sessionId: session._id,
    status: "processing",
  });

  (async () => {
    try {
      pushSocketUpdate(
        io,
        userId,
        session._id,
        "GENERATING_QUESTIONS",
        "Generating questions..."
      );

      const aiResponse = await fetch(`${AI_SERVICE_URL}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          level,
          count: Number(count),
          interview_type: interviewType,
        }),
      });

      if (!aiResponse.ok) {
        const errorBody = await aiResponse.text();
        throw new Error(`AI question generation failed: ${aiResponse.status} - ${errorBody}`);
      }

      const aiData = await aiResponse.json();

      if (!Array.isArray(aiData.questions)) {
        throw new Error("AI did not return questions array");
      }

      // const codingCount = Math.floor(Number(count) * 0.2);
      // const hrCount = Math.floor(Number(count) * 0.2);
      // const technicalCount = Number(count) - codingCount - hrCount;

      session.questions = aiData.questions.map((qText, index) => ({
        questionText: qText,
        questionType: interviewType,
          // index < codingCount
          //   ? "coding"
          //   : index < codingCount + technicalCount
          //   ? "Technical"
          //   : "HR",
        questionDifficulty:
          level === "Junior" ? "easy" : level === "Senior" ? "hard" : "medium",
        answerisSubmitted: false,
        answerisEvaluated: false,
      }));

      session.status = "in-progress";
      await session.save();

      pushSocketUpdate(
        io,
        userId,
        session._id,
        "QUESTIONS_READY",
        "Questions are ready.",
        session
      );
    } catch (error) {
      console.error("SESSION CREATION FAILED:", error.message);

      session.status = "failed";
      await session.save();

      pushSocketUpdate(
        io,
        userId,
        session._id,
        "GENERATION_FAILED",
        error.message,
        session
      );
    }
  })();
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("-questions.userAnswer -questions.userSubmittedCode");

  res.status(200).json(sessions);
});

const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  res.status(200).json({
    success: true,
    session,
  });
});

const deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  if (session.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  await session.deleteOne();

  res.status(200).json({
    success: true,
    id: req.params.id,
  });
});

const calculateoverallScore = async (sessionId) => {
  const results = await Session.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(sessionId) } },
    { $unwind: "$questions" },
    {
      $group: {
        _id: "$_id",
        avgTechnical: {
          $avg: {
            $cond: [
              { $eq: ["$questions.answerisEvaluated", true] },
              "$questions.technicalScore",
              0,
            ],
          },
        },
        avgConfidence: {
          $avg: {
            $cond: [
              { $eq: ["$questions.answerisEvaluated", true] },
              "$questions.confidenceScore",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        overallScore: {
          $round: [{ $avg: ["$avgTechnical", "$avgConfidence"] }, 0],
        },
        avgTechnical: { $round: ["$avgTechnical", 0] },
        avgConfidence: { $round: ["$avgConfidence", 0] },
      },
    },
  ]);

  return results[0] || {
    overallScore: 0,
    avgTechnical: 0,
    avgConfidence: 0,
  };
};

const evaluateAnswerAsync = async (
  io,
  userId,
  sessionId,
  questionIndex,
  audioFile= null,
  codeSubmission = null
) => {
    console.log("EVALUATE STARTED");
console.log("questionIndex:", questionIndex);
console.log("audioFile:", audioFile);
console.log("codeSubmission:", codeSubmission);
  let transcription = " ";

  const questionIdx =
    typeof questionIndex === "string"
      ? parseInt(questionIndex, 10)
      : questionIndex;

  const session = await Session.findById(sessionId);

  if (!session) return;

  const question = session.questions[questionIdx];

  if (!question) {
    pushSocketUpdate(io, userId, sessionId, "EVALUATION_FAILED", "Question not found.", session);
    return;
  }

  if (audioFile) {
    try {
      pushSocketUpdate(io, userId, sessionId, "AI_TRANSCRIPTING", "Transcribing audio...");

    //   if (!fs.existsSync(audioFilePath)) {
    //   throw new Error(`Audio file not found: ${audioFilePath}`);
    // }

      const formData = new FormData();
      // formData.append("file", fs.createReadStream(audioFile));
      formData.append("file", audioFile.buffer, {
        filename: audioFile.originalname || "answer.webm",
        contentType: audioFile.mimetype || "audio/webm",
      });

      

      const transResponse = await fetch(`${AI_SERVICE_URL}/transcribe`, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      console.log("Transcribe status:", transResponse.status);

if (!transResponse.ok) {
  const err = await transResponse.text();
  console.error("Transcribe API Error:", err);
  throw new Error(`Transcribe failed: ${transResponse.status}`);
}

const transData = await transResponse.json();
transcription = transData.transcription || "";

      if (transResponse.ok) {
        const transData = await transResponse.json();
        transcription = transData.transcription || " ";
      }
      else
      {
        const errText = await transResponse.text();
        console.error("TRANSCRIPTION API ERROR:", errText);
      }
    } catch (error) {
      console.error("TRANSCRIPTION ERROR:", error.message);
    }
    // } finally {
    //   if (audioFile && fs.existsSync(audioFile)) {
    //     fs.unlinkSync(audioFile);
    //   }
    //}
  }

  try {
    pushSocketUpdate(io, userId, sessionId, "AI_EVALUATING", "AI is evaluating...");

    const evalResponse = await fetch(`${AI_SERVICE_URL}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.questionText,
        question_type: question.questionType,
        role: session.role,
        level: session.level,
        user_answer: transcription,
        user_code: codeSubmission || " ",
      }),
    });

    if (!evalResponse.ok) {
      const errText = await evalResponse.text();
      throw new Error(`AI evaluation failed: ${evalResponse.status} - ${errText}`);
    }

    const evalData = await evalResponse.json();

    question.userAnswer = transcription;
    question.userSubmittedCode = codeSubmission || " ";
    question.technicalScore = evalData.technicalScore || 0;
    question.confidenceScore = evalData.confidenceScore || 0;
    question.AIFeedback = evalData.AIFeedback || evalData.aiFeedback || "";
    question.idealAnswer = evalData.idealAnswer || "";
    question.answerisEvaluated = true;

    const allQuestionsEvaluated = session.questions.every(
      (q) => q.answerisEvaluated
    );

    if (allQuestionsEvaluated) {
      const scoreSummary = await calculateoverallScore(sessionId);

      session.overallScore = scoreSummary.overallScore || 0;
      session.metrics = {
        avgTechnical: scoreSummary.avgTechnical,
        avgConfidence: scoreSummary.avgConfidence,
      };
      session.status = "completed";
      session.endTime = new Date();

      await session.save();

      pushSocketUpdate(io, userId, sessionId, "SESSION_COMPLETED", "Interview completed.", session);
    } else {
      await session.save();

      pushSocketUpdate(io, userId, sessionId, "EVALUATION_COMPLETE", "Feedback is ready.", session);
    }
  } catch (error) {
    console.error("EVALUATION ERROR:", error.message);

    pushSocketUpdate(io, userId, sessionId, "EVALUATION_FAILED", error.message, session);
  }
};

// const evaluateAnswerAsync = async (
//   io,
//   userId,
//   sessionId,
//   questionIndex,
//   audioFilePath = null,
//   codeSubmission = null
// ) => {
//   console.log("========== EVALUATE STARTED ==========");
//   console.log("questionIndex:", questionIndex);
//   console.log("audioFilePath:", audioFilePath);
//   console.log("codeSubmission:", codeSubmission);

//   let transcription = " ";

//   const questionIdx =
//     typeof questionIndex === "string"
//       ? parseInt(questionIndex, 10)
//       : questionIndex;

//   const session = await Session.findById(sessionId);

//   if (!session) {
//     console.log("SESSION NOT FOUND");
//     return;
//   }

//   const question = session.questions[questionIdx];

//   if (!question) {
//     pushSocketUpdate(
//       io,
//       userId,
//       sessionId,
//       "EVALUATION_FAILED",
//       "Question not found.",
//       session
//     );
//     return;
//   }

//   if (audioFilePath) {
//     try {
//       pushSocketUpdate(
//         io,
//         userId,
//         sessionId,
//         "AI_TRANSCRIPTING",
//         "Transcribing audio...",
//         session
//       );

//       console.log("CALLING TRANSCRIBE API");

//       const formData = new FormData();
//       formData.append("file", fs.createReadStream(audioFilePath));

//       const transResponse = await fetch(`${AI_SERVICE_URL}/transcribe`, {
//         method: "POST",
//         body: formData,
//         headers: formData.getHeaders(),
//       });

//       console.log("TRANSCRIBE STATUS:", transResponse.status);

//       if (transResponse.ok) {
//         const transData = await transResponse.json();
//         console.log("TRANSCRIBE DATA:", transData);
//         transcription = transData.transcription || " ";
//       } else {
//         const transErr = await transResponse.text();
//         console.log("TRANSCRIBE ERROR:", transErr);
//       }
//     } catch (error) {
//       console.error("TRANSCRIPTION ERROR:", error);
//     } finally {
//       if (audioFilePath && fs.existsSync(audioFilePath)) {
//         fs.unlinkSync(audioFilePath);
//       }
//     }
//   }

//   try {
//     pushSocketUpdate(
//       io,
//       userId,
//       sessionId,
//       "AI_EVALUATING",
//       "AI is evaluating...",
//       session
//     );

//     console.log("CALLING EVALUATE API");

//     const evalResponse = await fetch(`${AI_SERVICE_URL}/evaluate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         question: question.questionText,
//         question_type: question.questionType,
//         role: session.role,
//         level: session.level,
//         user_answer: transcription,
//         user_code: codeSubmission || " ",
//       }),
//     });

//     console.log("EVALUATE STATUS:", evalResponse.status);

//     if (!evalResponse.ok) {
//       const errText = await evalResponse.text();
//       throw new Error(
//         `AI evaluation failed: ${evalResponse.status} - ${errText}`
//       );
//     }

//     const evalData = await evalResponse.json();

//     console.log("===== AI RESPONSE =====");
//     console.log(evalData);

//     question.userAnswer = transcription;
//     question.userSubmittedCode = codeSubmission || " ";
//     question.technicalScore = Number(evalData.technicalScore) || 0;
//     question.confidenceScore = Number(evalData.confidenceScore) || 0;
//     question.AIFeedback = evalData.AIFeedback || evalData.aiFeedback || "";
//     question.idealAnswer = evalData.idealAnswer || "";
//     question.answerisEvaluated = true;

//     const allQuestionsEvaluated = session.questions.every(
//       (q) => q.answerisEvaluated
//     );

//     if (allQuestionsEvaluated) {
//       const scoreSummary = await calculateoverallScore(sessionId);

//       session.overallScore = scoreSummary.overallScore || 0;
//       session.metrics = {
//         avgTechnical: scoreSummary.avgTechnical,
//         avgConfidence: scoreSummary.avgConfidence,
//       };
//       session.status = "completed";
//       session.endTime = new Date();

//       console.log("Saving completed session...");
//       await session.save();
//       console.log("Session Saved");

//       pushSocketUpdate(
//         io,
//         userId,
//         sessionId,
//         "SESSION_COMPLETED",
//         "Interview completed.",
//         session
//       );
//     } else {
//       console.log("Saving evaluated question...");
//       await session.save();
//       console.log("Session Saved");

//       pushSocketUpdate(
//         io,
//         userId,
//         sessionId,
//         "EVALUATION_COMPLETE",
//         "Feedback is ready.",
//         session
//       );
//     }
//   } catch (error) {
//     console.error("EVALUATION ERROR:", error);
//     console.error(error.stack);

//     pushSocketUpdate(
//       io,
//       userId,
//       sessionId,
//       "EVALUATION_FAILED",
//       error.message,
//       session
//     );
//   }
// };
const submitAnswer = asyncHandler(async (req, res) => {
     console.log("========== SUBMIT ANSWER ==========");
     console.log("BODY:", req.body);
     console.log("FILE:", req.file);
  const sessionId = req.params.id;
  const { questionIndex, code } = req.body;
  const userId = req.user._id;

  const session = await Session.findById(sessionId);

  if (!session || session.user.toString() !== userId.toString()) {
    return res.status(404).json({
      success: false,
      message: "Session not found or user is not authorized",
    });
  }

  const questionIdx = parseInt(questionIndex, 10);
  const question = session.questions[questionIdx];

  if (!question) {
    return res.status(400).json({
      success: false,
      message: `Invalid question index: ${questionIdx}`,
    });
  }

  // let audioFilePath = null;

  // if (req.file) {
  //   audioFilePath = path.join(process.cwd(), req.file.path);
    
  // }

  const audioFile = req.file || null;

  question.answerisSubmitted = true;
  await session.save();

  res.status(202).json({
    success: true,
    message: "Answer received. Processing asynchronously...",
  });

  const io = req.app.get("io");

  evaluateAnswerAsync(
    io,
    userId,
    sessionId,
    questionIdx,
    // audioFilePath,
    audioFile,
    code || null
  );
});

const endSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const userId = req.user._id;

  const session = await Session.findById(sessionId);

  if (!session || session.user.toString() !== userId.toString()) {
    res.status(404);
    throw new Error("Session not found or user unauthorized.");
  }

  const isProcessing = session.questions.some(
    (q) => q.answerisSubmitted && !q.answerisEvaluated
  );

  if (isProcessing) {
    res.status(400);
    throw new Error("Cannot end interview while AI is processing answers.");
  }

  if (session.status === "completed") {
    res.status(400);
    throw new Error("Session is already completed.");
  }

  const scoreSummary = await calculateoverallScore(sessionId);

  session.overallScore = scoreSummary.overallScore || 0;
  session.status = "completed";
  session.endTime = new Date();

  session.metrics = {
    avgTechnical: scoreSummary.avgTechnical,
    avgConfidence: scoreSummary.avgConfidence,
  };

  await session.save();

  const io = req.app.get("io");

  pushSocketUpdate(
    io,
    userId,
    sessionId,
    "SESSION_COMPLETED",
    "Interview session ended.",
    session
  );

  res.status(200).json({
    success: true,
    message: "Session ended successfully.",
    session,
  });
});

export {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
  submitAnswer,
  endSession,
  calculateoverallScore,
};

