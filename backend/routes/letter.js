import express from "express";
import {
  uploadLetter as uploadLetterController,
  getStudentLetters,
  getMyLetters,
  getAllLetters,
  deleteLetter
} from "../controllers/lettercontroller.js";
import protect from "../middleware/authMiddleware.js";
import { uploadLetter as uploadLetterMiddleware } from "../utils/upload.js";

const router = express.Router();

router.use(protect);

router.post("/", uploadLetterMiddleware, uploadLetterController);
router.get("/", getMyLetters);
router.get("/all", getAllLetters);
router.get("/student/:studentId", getStudentLetters);
router.delete("/:id", deleteLetter);

export default router;
