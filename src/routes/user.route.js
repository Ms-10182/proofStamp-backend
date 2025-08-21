import { Router } from "express";
import { getNonce, verify,justGetToken,logout } from "../controllers/user.controller.js";
const router = Router();

router.get("/nonce", getNonce);
router.post("/verify", verify);
router.post("/token", justGetToken);
router.post("/logout", logout);

export default router;