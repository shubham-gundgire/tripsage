# Cloudinary Setup for TripSage

This guide explains how to set up Cloudinary for image uploads in the TripSage application.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. After signing up, you'll be directed to your dashboard where you can find your account details.

## Step 2: Get Your Cloudinary Credentials

From your Cloudinary dashboard, note down the following:
- Cloud name
- API Key
- API Secret

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root of your project and add the following variables:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with the values from your Cloudinary dashboard.

## Step 4: Restart Your Development Server

After adding the environment variables, restart your development server for the changes to take effect:

```
npm run dev
```

## Usage

The blog creation page now supports two ways to add cover images:

1. **Upload an image directly**: Click the "Upload Image" button to select an image from your device. The image will be uploaded to Cloudinary and the URL will be automatically filled in.

2. **Enter an image URL manually**: If you already have an image hosted elsewhere, you can paste its URL directly into the input field.

## Troubleshooting

- If you encounter upload errors, check your browser console for more details.
- Ensure your Cloudinary credentials are correctly set in the `.env.local` file.
- Verify that your Cloudinary account is active and has sufficient upload credits (free tier includes ample credits for development). 