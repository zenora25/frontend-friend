import express from "express";
import { createIndustrySupervisor, getIndustrySupervisors } from "../controllers/industrySupervisorController.js";

const router = express.Router();

router.post("/", createIndustrySupervisor);
router.get("/", getIndustrySupervisors);

export default router;
