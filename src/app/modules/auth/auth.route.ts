import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { configs } from "../../config/index";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post(
  "/change-password",
  checkAuth(...(Object.values(UserRole) as string[])),
  AuthControllers.changePassword,
);
router.post(
  "/set-password",
  checkAuth(...(Object.values(UserRole) as string[])),
  AuthControllers.setPassword,
);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post(
  "/reset-password",
  checkAuth(...(Object.values(UserRole) as string[])),
  AuthControllers.resetPassword,
);

//  for google authentication
router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = (req.query.redirect as string) || "/";

    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect,
    })(req, res, next);
  },
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${configs.frontend_url}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthControllers.googleCallbackControll,
);

export const AuthRoutes = router;
