import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken,getAnnouncements);
router.post("/",verifyToken, createAnnouncement);
router.delete("/:id", verifyToken, deleteAnnouncement);

export default router;
