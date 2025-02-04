import {Router} from "express";
import {  checkAuth, logIn, logOut, signUp,  } from "../controllers/authentication.controllers.mjs";
import { checkAuthToken } from "../utils/jwtAuthentication.mjs";
const router = Router();
router.post("/sign-up",signUp);
router.post("/log-in",logIn);
router.get("/logout",logOut);
router.get("/checkAuth",checkAuthToken,checkAuth);
export default router;