import express from "express";
import { createSIWESCoordinator, getSIWESCoordinators } from "../controllers/siwesCoordinatorcontroller.js";

const router = express.Router();

router.post("/", createSIWESCoordinator);
router.get("/", getSIWESCoordinators);

export default router;
