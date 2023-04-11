import { storage } from "../index.js";
import cloudConfig from "../config/cloudConfig.js";
const bucketName = "chat-connect";

class CloudService {
  static addFileCloud = async (respFile) => {
    const fileName = `${Date.now()}-${respFile.originalname}`;
    const file = storage.bucket(bucketName).file(fileName);
    await file.save(respFile.buffer, {
      metadata: {
        contentType: respFile.mimetype,
      },
    });
    const publicUrl = cloudConfig.publicImagePath(bucketName, fileName);
    return publicUrl;
  };

  static deleteFileCloud = async (fileName) => {
    const fileCloudName = cloudConfig.publicToPrivatePath(fileName);
    const file = storage.bucket(bucketName).file(fileCloudName);
    await file.delete();
  };
}

export default CloudService;
