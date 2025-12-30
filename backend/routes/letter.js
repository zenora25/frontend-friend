import express from "express";
import { 
  uploadLetter, 
  getStudentLetters, 
  getAllLetters 
} from "../controllers/lettercontroller.js";

const router = express.Router();

router.post("/", uploadLetter);
router.get("/", getAllLetters);
router.get("/student/:studentId", getStudentLetters);

export default router;
