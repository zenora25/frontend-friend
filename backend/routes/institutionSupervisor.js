import express from "express";
import { createInstitutionSupervisor, getInstitutionSupervisors } from "../controllers/institutionSupervisorController.js";

const router = express.Router();

router.post("/", createInstitutionSupervisor);
router.get("/", getInstitutionSupervisors);

export default router;
