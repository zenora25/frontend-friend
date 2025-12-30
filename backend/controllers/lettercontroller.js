import letter from "../models/letter.js";

// Upload a new letter
export const uploadLetter = async (req, res) => {
  try {
    const { studentId, fileUrl } = req.body;

    const letter = await letter.create({ studentId, fileUrl });

    res.status(201).json({
      message: "Letter uploaded successfully",
      letter,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload letter" });
  }
};

// Get letters for a specific student
export const getStudentLetters = async (req, res) => {
  try {
    const { studentId } = req.params;

    const letters = await Letter.findAll({ where: { studentId } });

    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch student letters" });
  }
};

// Get all letters
export const getAllLetters = async (req, res) => {
  try {
    const letters = await Letter.findAll();
    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch letters" });
  }
};
