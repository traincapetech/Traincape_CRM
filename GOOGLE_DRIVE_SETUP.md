# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for storing employee documents and other files in your CRM system.

## 🚀 **Benefits of Google Drive Integration**

- **Production Ready**: Files work in production environments
- **Scalable**: No local storage limitations
- **Secure**: Google's enterprise-grade security
- **Accessible**: Files accessible from anywhere
- **Backup**: Automatic Google Drive backups

## 📋 **Prerequisites**

1. **Google Cloud Project**: You need a Google Cloud Project
2. **Google Drive API**: Enable the Google Drive API
3. **Service Account**: Create a service account for API access
4. **Google Drive Folder**: Create a folder to store your files

## 🔧 **Step-by-Step Setup**

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID** --> employee-data-468410

### **Step 2: Enable Google Drive API**

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

### **Step 3: Create Service Account**

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - **Name**: `crm-file-storage`
   - **Description**: `Service account for CRM file storage`
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

### **Step 4: Generate Service Account Key**

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the JSON file
6. **Rename** it to `google-credentials.json`
7. **Place** it in `server/config/` directory

### **Step 5: Create Google Drive Folder**

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called `CRM-Documents`
3. Right-click the folder and select **Share**
4. Add your service account email (found in the JSON file)
5. Give it **Editor** permissions
6. Copy the **Folder ID** from the URL

### **Step 6: Configure Environment Variables**

Add these to your `.env` file:

```env
# Google Drive Configuration
USE_GOOGLE_DRIVE=true
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
```

### **Step 7: Update Production Environment**

For production deployment, add these environment variables to your hosting platform:

```env
USE_GOOGLE_DRIVE=true
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
```

## 📁 **File Organization**

The system automatically organizes files into these folders:

- **Employee-Photos**: Employee profile pictures
- **Employee-Documents/Education**: Educational certificates
- **Employee-Documents/Identity**: ID documents (Aadhar, PAN, etc.)
- **Employee-Documents/Resume**: Resume files
- **Employee-Documents/Employment**: Offer letters, etc.
- **Incentive-Documents**: Incentive-related files
- **Profile-Pictures**: User profile pictures
- **General-Documents**: Other files

## 🔒 **Security Considerations**

1. **Service Account**: Keep the JSON credentials secure
2. **Folder Permissions**: Only give necessary permissions
3. **Environment Variables**: Don't commit credentials to version control
4. **File Access**: Files are made publicly readable for easy access

## 🧪 **Testing the Integration**

1. **Start your server** with Google Drive enabled
2. **Upload an employee document** through the CRM
3. **Check Google Drive** to see if the file appears
4. **Verify file access** through the CRM interface

## 🔄 **Migration from Local Storage**

If you have existing files in local storage:

1. **Backup** your current files
2. **Enable Google Drive** integration
3. **Re-upload** important documents
4. **Update** employee records with new file URLs

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"Google Drive not initialized"**
   - Check if credentials file exists
   - Verify file path in environment variables
   - Ensure Google Drive API is enabled

2. **"Permission denied"**
   - Check service account permissions
   - Verify folder sharing settings
   - Ensure folder ID is correct

3. **"File upload failed"**
   - Check internet connection
   - Verify file size limits
   - Check Google Drive quota

### **Fallback Behavior**

If Google Drive fails, the system automatically falls back to local storage, ensuring your application continues to work.

## 📞 **Support**

If you encounter issues:

1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Test with a simple file upload first
4. Ensure your Google Cloud project has billing enabled

## 🎯 **Next Steps**

After setup:

1. **Test** file uploads and downloads
2. **Monitor** Google Drive usage
3. **Set up** automated backups if needed
4. **Train** users on the new file system

---

**Note**: This integration provides a robust, scalable solution for file storage that works seamlessly in both development and production environments. 

Preeoject ID: employee-data-468406