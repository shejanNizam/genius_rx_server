// for all type of file
import crypto from "crypto";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (_req: Express.Request, file: Express.Multer.File) => {
    const baseName = file.originalname
      .toLowerCase()
      .replace(/\.[^.]+$/, "") // strip extension
      .replace(/\s+/g, "-") // spaces → dashes
      .replace(/[^a-z0-9-]/g, "") // strip non-alphanumeric
      .slice(0, 60); // cap length

    return {
      folder: "tour_management",
      resource_type: "auto",
      public_id: `${crypto.randomUUID()}-${baseName}`,
    };
  },
});

export const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

//  for specific file
// import crypto from "crypto";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { cloudinaryUpload } from "./cloudinary.config";

// const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinaryUpload,
//   params: async (_req: Express.Request, file: Express.Multer.File) => {
//     const baseName = file.originalname
//       .toLowerCase()
//       .replace(/\.[^.]+$/, "")   // strip extension
//       .replace(/\s+/g, "-")       // spaces → dashes
//       .replace(/[^a-z0-9-]/g, "") // strip non-alphanumeric
//       .slice(0, 60);              // cap length

//     return {
//       folder: "tour_management",
//       resource_type: "image",
//       allowed_formats: ["jpg", "jpeg", "png", "webp"],
//       public_id: `${crypto.randomUUID()}-${baseName}`,
//     };
//   },
// });

// const fileFilter = (
//   _req: Express.Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback,
// ) => {
//   if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp`));
//   }
// };

// export const multerUpload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: MAX_FILE_SIZE_BYTES },
// });
