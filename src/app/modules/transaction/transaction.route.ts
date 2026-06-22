import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { TransactionControllers } from "./transaction.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];
const { admin, super_admin } = UserRole;

router.post("/", checkAuth(...allRoles), TransactionControllers.createTransaction);
router.get("/my", checkAuth(...allRoles), TransactionControllers.getMyTransactions);
router.get("/", checkAuth(admin, super_admin), TransactionControllers.getAllTransactions);
router.patch("/:id/status", checkAuth(admin, super_admin), TransactionControllers.updateTransactionStatus);

export const TransactionRoutes = router;
