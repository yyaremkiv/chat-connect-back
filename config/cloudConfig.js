const cloudConfig = {
  publicImagePath: (bucketName, fileName) =>
    `https://storage.cloud.google.com/${bucketName}/${fileName}`,
  publicImagePathDefault:
    "https://storage.cloud.google.com/chat-connect/no-user-image.jpg",
  publicToPrivatePath: (fileName) => {
    const fileCloudName = fileName.slice(fileName.lastIndexOf("/") + 1);
    return fileCloudName;
  },
};

export default cloudConfig;
