import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { authAPI } from "../services/api";
import { FaCamera, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";

const ProfilePage = () => {
  const { user, loading, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

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
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
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
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-2xl font-bold">User Profile</h2>
          </div>
          <div className="p-6">
            <div className="mb-8 text-center">
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
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
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
              
              {/* Preview Controls */}
              {previewUrl && (
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
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mt-2">
                {user.role}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-bold mb-2">Account Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium">{user._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {user.role === "Sales Person" && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-bold mb-2">Sales Information</h4>
                  <p className="text-gray-600">You have access to view and manage leads assigned to you.</p>
                </div>
              )}
              
              {user.role === "Lead Person" && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-bold mb-2">Lead Management</h4>
                  <p className="text-gray-600">You have access to create leads and view leads assigned to you.</p>
                </div>
              )}
              
              {(user.role === "Admin" || user.role === "Manager") && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-bold mb-2">Administrative Access</h4>
                  <p className="text-gray-600">You have access to all leads and administrative functions.</p>
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