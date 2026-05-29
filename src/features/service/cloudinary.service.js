import cloudinary from "../../shared/config/cloudinary.js";

export async function uploadToCloudinary(buffer, folder = "products") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
