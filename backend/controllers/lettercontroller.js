import Letter from "../models/letter.js";
import path from "path";
import fs from "fs";

// Upload a new letter
export const uploadLetter = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
    const { type = 'ACCEPTANCE' } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/letters/${req.file.filename}`;

    const newLetter = await Letter.create({
      studentId,
      fileUrl,
      fileName: req.file.originalname,
      type,
      status: "UPLOADED"
    });

    res.status(201).json({
      message: "Letter uploaded successfully",
      letter: newLetter,
    });
  } catch (err) {
    console.error("❌ Letter upload error:", err.message);
    res.status(500).json({ error: "Failed to upload letter" });
  }
};

// Get letters for a specific student (For supervisors/admin)
export const getStudentLetters = async (req, res) => {
  try {
    const { studentId } = req.params;
    const letters = await Letter.findAll({ where: { studentId } });
    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student letters" });
  }
};

// Get letters for the logged-in student
export const getMyLetters = async (req, res) => {
  try {
    const studentId = req.user.id;
    const letters = await Letter.findAll({ where: { studentId } });
    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch letters" });
  }
};

// Delete a letter
export const deleteLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const letter = await Letter.findOne({ where: { id, studentId } });

    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    // Delete physical file
    const filename = path.basename(letter.fileUrl);
    const filePath = path.join('uploads/letters', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await letter.destroy();
    res.json({ message: "Letter deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete letter" });
  }
};

// Get all letters (Admin/Coordinator)
export const getAllLetters = async (req, res) => {
  try {
    const letters = await Letter.findAll();
    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all letters" });
  }
};
