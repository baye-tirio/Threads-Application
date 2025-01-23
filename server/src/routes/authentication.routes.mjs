import {Router} from "express";
import {  logIn, logOut, signUp,  } from "../controllers/authentication.controllers.mjs";
const router = Router();
router.post("/sign-up",signUp);
router.post("/log-in",logIn);
router.get("/logout",logOut);
export default router;