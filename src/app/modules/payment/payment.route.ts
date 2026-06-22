import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  PaymentController.getInvoiceDownloadUrl,
);

export const PaymentRoutes = router;
