import AWS from "aws-sdk";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

// Create S3 service object
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
});

export const uploadToS3 = async (file, fileName) => {
  const params = {
    Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
    Key: `profile-images/${fileName}`,
    Body: file,
    ContentType: file.type,
    ACL: "public-read", // Make the file publicly readable
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location; // Returns the public URL of the uploaded file
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
};

export default s3;
