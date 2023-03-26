const cloudConfig = {
  imagePath: (bucketName, fileName) =>
    `https://storage.cloud.google.com/${bucketName}/${fileName}`,
  imagePathDefault:
    "https://storage.cloud.google.com/chat-connect/no-user-image.jpg",
};

export default cloudConfig;
