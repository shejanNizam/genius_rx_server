import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { TourControllers } from "./tour.controller";
import { createTourZodSchema, updateTourZodSchema } from "./tour.validation";

const router = Router();

//  TOUR_TYPE ROUTES
router.post("/create-tour-type", TourControllers.createTourType);
router.get("/tour-types/all", TourControllers.getAllTourTypes);
router.get("/tour-types/:id", TourControllers.getSingleTourType);
router.patch("/tour-types/:id", TourControllers.updateTourType);
router.delete("/tour-types/:id", TourControllers.deleteTourType);

//  TOUR ROUTES
router.post(
  "/create",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.array("files"),
  validateRequest(createTourZodSchema),
  TourControllers.createTour,
);
router.get("/all", TourControllers.getAllTours);
router.get("/:slug", TourControllers.getSingleTour);
router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.array("files"),
  validateRequest(updateTourZodSchema),
  TourControllers.updateTour,
);
router.delete("/:id", TourControllers.deleteTour);

export const TourRoutes = router;
