import { storage } from "../../index.js";
import cloudConfig from "../../config/cloudConfig.js";
const bucketName = "chat-connect";

export const addFileCloud = async (respFile) => {
  const fileName = `${Date.now()}-${respFile.originalname}`;
  const file = storage.bucket(bucketName).file(fileName);
  await file.save(respFile.buffer, {
    metadata: {
      contentType: respFile.mimetype,
    },
  });
  const publicUrl = cloudConfig.imagePath(bucketName, fileName);
  return publicUrl;
};

export const updateFileCloud = async (fileName, respFile) => {
  const file = storage.bucket(bucketName).file(fileName);
  await file.delete();
  await file.save(respFile.buffer, {
    metadata: {
      contentType: respFile.mimetype,
    },
    resumable: false,
  });
  const publicUrl = cloudConfig.imagePath(bucketName, fileName);
  return publicUrl;
};
