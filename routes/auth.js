import Router from "express";
import authController from "../controllers/auth-controller.js";
const router = new Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/activate/:link", authController.activate);
router.get("/refresh", authController.refresh);

export default router;
