import express from "express";
import { createStudent, getStudents, updateStudent } from '../controllers/studentcontroller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createStudent);
router.get('/', getStudents);
router.put('/:id', protect, updateStudent);

export default router;