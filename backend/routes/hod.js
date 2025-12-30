import express from "express";
import { createHod, getHods } from "../controllers/hodcontroller.js";

const router = express.Router();

router.post("/", createHod);
router.get("/", getHods);

export default router;
