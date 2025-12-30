import siwesCoordinator from "../models/siwesCoordinator.js";

// CREATE SIWES COORDINATOR
export const createSIWESCoordinator = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const coordinator = await siwesCoordinator.create({
      fullName,
      email,
      password,
    });

    res.status(201).json({
      message: "SIWES Coordinator created",
      coordinator,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create coordinator",
      details: err.message,
    });
  }
};

// GET ALL SIWES COORDINATORS
export const getSIWESCoordinators = async (req, res) => {
  try {
    const coordinators = await siwesCoordinator.findAll();
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch coordinators",
      details: err.message,
    });
  }
};
