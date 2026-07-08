
import express from "express";
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
  submitAnswer,
  endSession,
} from "../Controllers/session.js";

import { protect } from "../Middlewares/authentication.js";
import { uploadSingleAudio } from "../Middlewares/upload.js";

const router = express.Router();

router.use(protect);



router.route("/")
    .get(getSessions)      // Fetch all sessions
    .post(createSession);  // Create new session

// 2. ID Routes ("/:id")
router.route("/:id")
    .get(getSessionById)   // View session details
    .delete(deleteSession); // Delete session

// 3. Action Routes
router.route("/:id/submit-answer").post(uploadSingleAudio, submitAnswer);
router.route("/:id/end").post(endSession);

export default router;