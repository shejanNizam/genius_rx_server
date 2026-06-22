/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import httpStatus from "http-status";
import stream from "stream";
import { configs } from "./index";
import AppError from "../errorHelpers/AppError";

cloudinary.config({
  cloud_name: configs.CLOUDINARY.cloudinary_cloud_name,
  api_key: configs.CLOUDINARY.cloudinary_api_key,
  api_secret: configs.CLOUDINARY.cloudinary_api_secret,
});

//  for pdf
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const public_id = `pdf/${fileName}-${Date.now()}`;

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: public_id,
            folder: "pdf",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          },
        )
        .end(buffer);
    });
  } catch (error: any) {
    // console.log(error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Error uploading file ${error.message}`,
    );
  }
};

export const deleteImageFromCLoudinary = async (url: string) => {
  try {
    //https://res.cloudinary.com/djzppynpk/image/upload/v1753126572/ay9roxiv8ue-1753126570086-download-2-jpg.jpg.jpg

    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

    const match = url.match(regex);

    // console.log({ match });

    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      // console.log(`File ${public_id} is deleted from cloudinary`);
    }
  } catch (error: any) {
    throw new AppError(401, "Cloudinary image deletion failed", error.message);
  }
};

// Extracts public_id from a Cloudinary URL by splitting on /upload/ and stripping version + extension.
// e.g. https://res.cloudinary.com/xxx/image/upload/v123/folder/image.jpg → folder/image

// const extractPublicId = (url: string): string | null => {
//   const parts = url.split("/upload/");
//   if (parts.length < 2) return null;
//   const withoutVersion = parts[1]!.replace(/^v\d+\//, "");
//   return withoutVersion.replace(/\.[^.]+$/, "");
// };

// export const deleteImageFromCLoudinary = async (url: string): Promise<void> => {
//   const public_id = extractPublicId(url);
//   if (!public_id) return;
//   await cloudinary.uploader.destroy(public_id);
// };

export const cloudinaryUpload = cloudinary;
