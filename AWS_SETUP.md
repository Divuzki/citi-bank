# AWS S3 Setup Instructions

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **S3 Bucket**: Create an S3 bucket for storing profile images
3. **IAM User**: Create an IAM user with S3 permissions

## Step 1: Create S3 Bucket

1. Log into AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `your-app-name-profile-images`)
5. Select your preferred region
6. Configure bucket settings:
   - **Block Public Access**: Uncheck "Block all public access" (we need public read access for profile images)
   - **Bucket Versioning**: Enable if desired
   - **Server-side encryption**: Enable if desired
7. Create the bucket

## Step 2: Configure Bucket Policy

Add this bucket policy to allow public read access to uploaded images:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

**Replace `YOUR_BUCKET_NAME` with your actual bucket name.**

## Step 3: Create IAM User

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add user"
3. Enter username (e.g., `banking-app-s3-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. Search and select `AmazonS3FullAccess` (or create a custom policy with limited S3 permissions)
8. Complete user creation
9. **Important**: Save the Access Key ID and Secret Access Key

## Step 4: Configure Environment Variables

Update your `.env` file with the following values:

```env
# AWS S3 Configuration
REACT_APP_AWS_ACCESS_KEY_ID=your_actual_access_key_id
REACT_APP_AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
REACT_APP_AWS_REGION=your_bucket_region (e.g., us-east-1)
REACT_APP_S3_BUCKET_NAME=your_actual_bucket_name
```

## Step 5: Security Best Practices

### For Production:

1. **Use IAM Roles**: Instead of hardcoded credentials, use IAM roles when deploying to AWS services
2. **Limit IAM Permissions**: Create a custom IAM policy with minimal required permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

3. **Environment Variables**: Never commit `.env` file to version control
4. **CORS Configuration**: Configure CORS on your S3 bucket if needed:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## Testing

1. Start your React application: `npm start`
2. Navigate to the signup page: `http://localhost:3000/signup`
3. Try uploading a profile image
4. Check your S3 bucket to verify the image was uploaded

## Troubleshooting

### Common Issues:

1. **Access Denied**: Check IAM permissions and bucket policy
2. **CORS Errors**: Configure CORS settings on your S3 bucket
3. **Invalid Credentials**: Verify your AWS credentials in `.env` file
4. **Bucket Not Found**: Ensure bucket name and region are correct

### Error Messages:

- `SignatureDoesNotMatch`: Check your secret access key
- `InvalidAccessKeyId`: Check your access key ID
- `NoSuchBucket`: Verify bucket name and region
- `AccessDenied`: Check IAM permissions and bucket policy

## Cost Considerations

- S3 storage costs are typically very low for profile images
- Consider implementing image compression to reduce storage costs
- Monitor your AWS billing dashboard regularly

## Additional Features to Consider

1. **Image Resizing**: Use AWS Lambda to automatically resize uploaded images
2. **CDN**: Use CloudFront for faster image delivery
3. **Backup**: Enable S3 versioning and cross-region replication
4. **Monitoring**: Set up CloudWatch alerts for unusual activity