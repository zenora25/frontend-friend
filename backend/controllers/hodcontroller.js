import hod from "../models/hod.js";

 const createHod = async (req, res) => {
  try {
    const { fullName, email, department, password } = req.body;
    const hod = await hod.create({ fullName, email, department, password });
    res.status(201).json({ message: "HOD created", hod });
  } catch (err) {
    res.status(500).json({ error: "Failed to create HOD", details: err.message });
  }
};

 const getHods = async (req, res) => {
  try {
    const hods = await hod.findAll();
    res.json(hods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch HODs", details: err.message });
  }
};


export  {createHod,getHods}