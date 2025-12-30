import institutionSupervisor from "../models/institutionSupervisor.js";

export const createInstitutionSupervisor = async (req, res) => {
  try {
    const { fullName, email, department, password } = req.body;
    const supervisor = await institutionSupervisor.create({ fullName, email, department, password });
    res.status(201).json({ message: "Institution Supervisor created", supervisor });
  } catch (err) {
    res.status(500).json({ error: "Failed to create supervisor", details: err.message });
  }
};

export const getInstitutionSupervisors = async (req, res) => {
  try {
    const supervisors = await institutionSupervisor.findAll();
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch supervisors", details: err.message });
  }
};
