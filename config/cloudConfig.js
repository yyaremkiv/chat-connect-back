const cloudConfig = {
  publicImagePath: (bucketName, fileName) =>
    `https://storage.googleapis.com/${bucketName}/${fileName}`,
  publicImagePathDefault:
    "https://storage.googleapis.com/chat-connect/avatar/no-user-image.jpg",
  publicToPrivatePath: (fileName) => {
    const fileCloudName = fileName.slice(fileName.lastIndexOf("/") + 1);
    return fileCloudName;
  },
};

export default cloudConfig;
