import IndustrySupervisor from "../models/industrySupervisor.js";

export const createIndustrySupervisor = async (req, res) => {
  try {
    const { fullName, companyName, email, phone, password } = req.body;
    const supervisor = await IndustrySupervisor.create({ fullName, companyName, email, phone, password });
    res.status(201).json({ message: "Industry Supervisor created", supervisor });
  } catch (err) {
    res.status(500).json({ error: "Failed to create supervisor", details: err.message });
  }
};

export const getIndustrySupervisors = async (req, res) => {
  try {
    const supervisors = await IndustrySupervisor.findAll();
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch supervisors", details: err.message });
  }
};
