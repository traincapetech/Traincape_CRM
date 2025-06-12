import React, { useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { authAPI } from "../services/api";
import { FaCamera, FaCheck, FaTimes, FaCrop } from "react-icons/fa";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from "axios";

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const ProfilePage = () => {
  const { user, loading, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Format date for better readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  };

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setUploadError('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    // Reset error
    setUploadError(null);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  // Function to get cropped image
  const getCroppedImg = (image, crop) => {
    if (!crop || !image) return null;
    
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    
    return canvas.toDataURL('image/jpeg');
  };

  const handleCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const applyCrop = () => {
    if (!completedCrop || !imgRef.current) return;
    
    const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop);
    setPreviewUrl(croppedImageUrl);
    setIsCropping(false);
  };

  const uploadProfilePicture = async () => {
    if (!previewUrl) return;
    
    try {
      setUploading(true);
      setUploadError(null);
      
      console.log('Attempting to upload profile picture to:', '/api/auth/profile-picture');
      
      // Test route first to confirm API connectivity
      try {
        const testResponse = await axios.get('/api/auth/profile-picture-test');
        console.log('Test endpoint response:', testResponse.data);
      } catch (testError) {
        console.error('Test endpoint failed:', testError);
      }
      
      const response = await authAPI.updateProfilePicture(previewUrl);
      console.log('Profile picture update response:', response.data);
      
      if (response.data.success) {
        // Update the user in context
        setUser({
          ...user,
          profilePicture: previewUrl
        });
        
        // Clear the preview
        setPreviewUrl(null);
        setImage(null);
      } else {
        setUploadError('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setUploadError(`Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('Request was made but no response received:', error.request);
        setUploadError('No response received from server. Check network connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setUploadError(`Error: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setPreviewUrl(null);
    setImage(null);
    setIsCropping(false);
    setUploadError(null);
    setCrop(undefined);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden shadow-sm">
          <div className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white p-4">
            <h2 className="text-2xl font-bold">User Profile</h2>
          </div>
          <div className="p-6">
            <div className="mb-8 text-center">
              {/* Cropping UI */}
              {isCropping && image && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Adjust Your Profile Picture</h4>
                  <div className="max-w-md mx-auto">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={handleCropComplete}
                      aspect={1}
                      circularCrop
                    >
                      <img 
                        ref={imgRef}
                        src={image} 
                        alt="Crop Preview"
                        onLoad={onImageLoad}
                        className="max-w-full max-h-96"
                      />
                    </ReactCrop>
                    <div className="flex justify-center mt-4 space-x-3">
                      <button 
                        type="button" 
                        onClick={applyCrop}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                      >
                        <FaCrop className="mr-2" /> Apply Crop
                      </button>
                      <button 
                        type="button" 
                        onClick={cancelUpload}
                        className="px-4 py-2 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out0 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Picture Preview */}
              {!isCropping && (
                <div className="relative h-24 w-24 rounded-full mx-auto mb-4">
                  {/* Profile Picture */}
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile Preview" 
                      className="h-24 w-24 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.fullName} 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                  
                  {/* Camera Icon for Upload */}
                  <label 
                    htmlFor="profile-upload" 
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-full p-2 cursor-pointer transition-colors"
                  >
                    <FaCamera size={12} />
                  </label>
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>
              )}
              
              {/* Preview Controls */}
              {previewUrl && !isCropping && (
                <div className="flex justify-center space-x-3 mb-4">
                  <button
                    onClick={uploadProfilePicture}
                    disabled={uploading}
                    className={`p-2 rounded-full ${uploading ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    <FaCheck size={12} />
                  </button>
                  <button
                    onClick={cancelUpload}
                    disabled={uploading}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
              
              {uploadError && (
                <div className="text-red-500 text-sm mb-2">{uploadError}</div>
              )}
              
              <h3 className="text-xl font-bold mt-2">{user.fullName}</h3>
              <p className="text-gray-600 dark:text-gray-500">{user.email}</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mt-2">
                {user.role}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-lg font-bold mb-2">Account Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-500">User ID</p>
                    <p className="font-medium">{user._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {user.role === "Sales Person" && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="text-lg font-bold mb-2">Sales Information</h4>
                  <p className="text-gray-600 dark:text-gray-500">You have access to view and manage leads assigned to you.</p>
                </div>
              )}
              
              {user.role === "Lead Person" && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="text-lg font-bold mb-2">Lead Management</h4>
                  <p className="text-gray-600 dark:text-gray-500">You have access to create leads and view leads assigned to you.</p>
                </div>
              )}
              
              {(user.role === "Admin" || user.role === "Manager") && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="text-lg font-bold mb-2">Administrative Access</h4>
                  <p className="text-gray-600 dark:text-gray-500">You have access to all leads and administrative functions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 