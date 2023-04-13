import Router from "express";
import AuthController from "../controllers/auth-controller.js";
const router = new Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/activate/:link", AuthController.activate);
router.get("/refresh", AuthController.refresh);

export default router;
