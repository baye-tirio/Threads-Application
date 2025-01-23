import { Router } from "express";
import {
  createMessage,
  deleteConversation,
  deleteMessage,
  editMessage,
  getAllConversations,
  getConversation,
  getSearchedConversations,
} from "../controllers/chat.controllers.mjs";

const router = Router();
router.post("/message", createMessage);
router.delete("/message/:id", deleteMessage);
router.patch("/message/:id", editMessage);
router.delete("/conversation/:id", deleteConversation);
router.get("/conversation/:conversationId", getConversation);
router.get("/conversations", getAllConversations);
router.get("/search/conversations", getSearchedConversations);
export default router;
