const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require('fs'); // Added for file cleanup
const path = require('path'); // Added for path.join
const { UPLOAD_PATHS } = require('../config/storage');
const { sendEmail } = require('../config/nodemailer');
const asyncHandler = require('../middleware/async'); // Added for asyncHandler

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log("Register attempt:", { 
      email: req.body.email,
      fullName: req.body.fullName,
      role: req.body.role 
    });
    
    const { fullName, email, password, role } = req.body;
    
    // Basic validation
    if (!fullName || !email || !password) {
      console.log("Missing required registration fields");
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.log("Creating new user...");
    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'Sales Person', // Default role if not specified
    });

    console.log(`User created successfully with ID: ${user._id}`);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Registration error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // Provide more specific error messages for common issues
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user and explicitly select password field
    const user = await User.findOne({ email }).select('+password -__v');
    
    console.log('Found user:', user ? user._id : 'Not found');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();
    console.log('Generated token:', token);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: 'Please try again later'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error logging in. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Get all users for assignment
// @route   GET /api/auth/users
// @access  Private (only for Admin and Manager)
exports.getAllUsers = async (req, res) => {
  try {
    // Get the role filter from query params (if provided)
    const roleFilter = req.query.role || "";

    // Build the filter object
    const filter = {};
    if (roleFilter) {
      filter.role = roleFilter;
    }

    const users = await User.find(filter, "fullName email role");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private (Admin and Manager, but Manager cannot modify Admin accounts)
exports.updateUser = async (req, res) => {
  try {
    console.log(`Attempting to update user with ID: ${req.params.id}`);
    const { fullName, email, role } = req.body;

    // Check if user exists
    let user = await User.findById(req.params.id);

    if (!user) {
      console.log(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent Managers from modifying Admin accounts
    if (req.user.role === 'Manager' && user.role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot modify Admin accounts",
      });
    }

    // Prevent Managers from creating new Admin accounts
    if (req.user.role === 'Manager' && role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot create Admin accounts",
      });
    }

    // Update basic user data
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;

    // If password is provided, update it
    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password;
      // The password will be hashed via the pre-save middleware
    }

    // Save the user - this will trigger the pre-save hook for password hashing
    await user.save();

    // Make sure we don't return the password
    user = await User.findById(user._id);

    console.log(`User updated successfully: ${user._id}`);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(`Error updating user: ${err.message}`);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin and Manager, but Manager cannot delete Admin accounts)
exports.deleteUser = async (req, res) => {
  try {
    console.log(`Attempting to delete user with ID: ${req.params.id}`);

    // Check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      console.log(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent user from deleting themselves
    if (user._id.toString() === req.user.id) {
      console.log("User attempted to delete their own account");
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent Managers from deleting Admin accounts
    if (req.user.role === 'Manager' && user.role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot delete Admin accounts",
      });
    }

    // Delete user with the findByIdAndDelete method
    const result = await User.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Failed to delete user",
      });
    }

    console.log(`User deleted successfully: ${req.params.id}`);
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(`Error deleting user: ${err.message}`);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update profile picture
// @route   PUT /api/auth/profile-picture
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    console.log('Profile picture update requested by user:', req.user.id);
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    // Check if a file was uploaded
    if (!req.files || !req.files.profilePicture) {
      console.log('No profile picture file provided in request');
      return res.status(400).json({
        success: false,
        message: 'Please provide a profile picture file'
      });
    }
    
    const profilePictureFile = req.files.profilePicture[0];
    console.log('Received profile picture file:', profilePictureFile.filename);
    
    // Store the file path in the database using the new UPLOAD_PATHS
    const profilePicturePath = path.join(UPLOAD_PATHS.PROFILE_PICTURES, profilePictureFile.filename);
    
    // Update the user's profile picture
    console.log('Updating user profile picture in database');
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { profilePicture: profilePicturePath },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Profile picture updated successfully for user:', user._id);
    res.status(200).json({
      success: true,
      data: user,
      profilePicture: profilePicturePath
    });
  } catch (err) {
    console.error(`Error updating profile picture: ${err.message}`);
    console.error('Stack trace:', err.stack);
    res.status(400).json({
      success: false, 
      message: err.message
    });
  }
};

// @desc    Create new user (for Admin and Manager)
// @route   POST /api/auth/users
// @access  Private (Admin and Manager, but Manager cannot create Admin accounts)
exports.createUser = async (req, res) => {
  try {
    console.log("Create user attempt by:", req.user.role, "for:", req.body);
    const { fullName, email, password, role } = req.body;
    
    // Basic validation
    if (!fullName || !email || !password) {
      console.log("Missing required fields for user creation");
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password"
      });
    }

    // Prevent Managers from creating Admin accounts
    if (req.user.role === 'Manager' && role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot create Admin accounts",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.log("Creating new user...");
    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'Sales Person', // Default role if not specified
    });

    console.log(`User created successfully with ID: ${user._id}`);
    
    // Return user data without password
    const userData = await User.findById(user._id);
    
    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.error("User creation error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // Provide more specific error messages for common issues
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during user creation'
    });
  }
};

// @desc    Create new user with documents (for Admin and Manager)
// @route   POST /api/auth/users/with-documents
// @access  Private (Admin and Manager, but Manager cannot create Admin accounts)
exports.createUserWithDocuments = async (req, res) => {
  try {
    console.log("Create user with documents attempt by:", req.user.role);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files ? Object.keys(req.files) : 'No files');
    
    const { fullName, email, password, role } = req.body;
    
    // Basic validation
    if (!fullName || !email || !password) {
      console.log("Missing required fields for user creation");
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password"
      });
    }

    // Prevent Managers from creating Admin accounts
    if (req.user.role === 'Manager' && role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot create Admin accounts",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    let user;
    try {
      console.log("Creating new user...");
      user = await User.create({
        fullName,
        email,
        password,
        role: role || 'Sales Person', // Default role if not specified
      });
      console.log(`User created successfully with ID: ${user._id}`);
    } catch (userError) {
      console.error("Error creating user:", userError);
      throw userError;
    }
    
    // Handle employee creation for non-admin/non-hr roles
    if (['Sales Person', 'Lead Person', 'Manager', 'Employee'].includes(role)) {
      try {
        const Employee = require('../models/Employee');
        const Department = require('../models/Department');
        const Role = require('../models/EmployeeRole');
        
        // Find or create department
        let department = await Department.findOne({ name: 'General' });
        if (!department) {
          department = await Department.create({
            name: 'General',
            description: 'General Department for all employees'
          });
        }
        
        // Find or create role
        let employeeRole = await Role.findOne({ name: role });
        if (!employeeRole) {
          employeeRole = await Role.create({
            name: role,
            description: `Role for ${role}`
          });
        }
        
        // Create employee record
        const employeeData = {
          fullName,
          email,
          userId: user._id,
          role: employeeRole._id,
          department: department._id,
          
          // Add all the new fields from the admin form
          phoneNumber: req.body.phoneNumber || '',
          whatsappNumber: req.body.whatsappNumber || '',
          linkedInUrl: req.body.linkedInUrl || '',
          currentAddress: req.body.currentAddress || '',
          permanentAddress: req.body.permanentAddress || '',
          dateOfBirth: req.body.dateOfBirth || null,
          joiningDate: req.body.joiningDate || new Date(),
          salary: req.body.salary ? parseFloat(req.body.salary) : 0,
          status: req.body.status || 'ACTIVE',
          collegeName: req.body.collegeName || '',
          internshipDuration: req.body.internshipDuration ? parseInt(req.body.internshipDuration) : null
        };
        
        // Process uploaded documents using file storage service
        if (req.files) {
          console.log('Processing file uploads in auth controller:', Object.keys(req.files));
          const documentTypes = ['photograph', 'tenthMarksheet', 'twelfthMarksheet', 'bachelorDegree', 'postgraduateDegree', 'aadharCard', 'panCard', 'pcc', 'resume', 'offerLetter'];
          
          for (const docType of documentTypes) {
            if (req.files[docType] && req.files[docType][0]) {
              const file = req.files[docType][0];
              console.log(`Processing file ${docType}:`, {
                originalName: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path
              });
              
              try {
                const fileStorage = require('../services/fileStorageService');
                const uploaded = await fileStorage.uploadEmployeeDoc(file, docType);
                console.log(`File ${docType} uploaded successfully:`, uploaded);
                
                // Store the uploaded file info directly in employee data
                employeeData[docType] = uploaded;
              } catch (fileError) {
                console.error(`Error processing file ${docType}:`, fileError);
                // Continue with other files if one fails
              }
            }
          }
        } else {
          console.log('No files found in auth controller request');
        }
        
        console.log('Employee data before creation:', JSON.stringify(employeeData, null, 2));
        const employee = await Employee.create(employeeData);
        console.log(`Employee created successfully with ID: ${employee._id}`);
      } catch (employeeError) {
        console.error("Error creating employee record:", employeeError);
        console.error("Employee error details:", {
          name: employeeError.name,
          message: employeeError.message,
          code: employeeError.code,
          errors: employeeError.errors
        });
        // If employee creation fails, delete the user and throw error
        await User.findByIdAndDelete(user._id);
        throw new Error(`Failed to create employee record: ${employeeError.message}`);
      }
    }
    
    // Return user data without password
    const userData = await User.findById(user._id);
    
    // Also fetch and return employee data if it exists
    let employeeData = null;
    if (['Sales Person', 'Lead Person', 'Manager', 'Employee'].includes(role)) {
      const Employee = require('../models/Employee');
      employeeData = await Employee.findOne({ userId: user._id })
        .populate('department', 'name')
        .populate('role', 'name');
    }
    
    res.status(201).json({
      success: true,
      data: userData,
      employee: employeeData,
      message: 'User created successfully with documents'
    });
  } catch (err) {
    console.error("User creation with documents error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // Clean up any uploaded files if there was an error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(`Cleaned up file: ${file.path}`);
            }
          } catch (cleanupError) {
            console.error(`Error cleaning up file ${file.path}:`, cleanupError);
          }
        });
      });
    }
    
    // Provide more specific error messages for common issues
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during user creation'
    });
  }
};

// @desc    Update user with documents
// @route   PUT /api/auth/users/:id/with-documents
// @access  Private (Admin and Manager, but Manager cannot modify Admin accounts)
exports.updateUserWithDocuments = async (req, res) => {
  try {
    console.log(`Attempting to update user with documents, ID: ${req.params.id}`);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    // Validate required parameters
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const { fullName, email, role } = req.body;

    // Check if user exists
    let user = await User.findById(req.params.id);

    if (!user) {
      console.log(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent Managers from modifying Admin accounts
    if (req.user.role === 'Manager' && user.role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot modify Admin accounts",
      });
    }

    // Prevent Managers from making users Admin
    if (req.user.role === 'Manager' && role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: "Managers cannot create Admin accounts",
      });
    }

    // Update user fields - only update provided fields
    const updateData = {};
    if (fullName && fullName.trim() !== '') updateData.fullName = fullName;
    if (email && email.trim() !== '') updateData.email = email.toLowerCase().trim();
    if (role && role.trim() !== '') updateData.role = role;

    // Handle password update if provided
    if (req.body.password && req.body.password.trim() !== '') {
      updateData.password = req.body.password;
    }
    
    // Ensure we have at least some data to update
    if (Object.keys(updateData).length === 0 && (!req.files || Object.keys(req.files).length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update"
      });
    }

    // Update user only if there's data to update
    if (Object.keys(updateData).length > 0) {
      user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
    }

    console.log(`User updated successfully: ${user._id}`);
    
    // Handle employee update for non-admin/non-hr roles
    const userRole = updateData.role || user.role;
    if (['Sales Person', 'Lead Person', 'Manager', 'Employee'].includes(userRole)) {
      const Employee = require('../models/Employee');
      const Department = require('../models/Department');
      const Role = require('../models/EmployeeRole');
      
      console.log(`Looking for employee record for user: ${user._id}, role: ${userRole}`);
      
      // Find or create employee record
      let employee = await Employee.findOne({ userId: user._id });
      
      console.log(`Employee lookup result:`, {
        found: !!employee,
        employeeId: employee?._id,
        employeeUserId: employee?.userId,
        searchUserId: user._id
      });
      
      if (!employee) {
        console.log('No employee record found, creating new one...');
        // Find or create department
        let department = await Department.findOne({ name: 'General' });
        if (!department) {
          department = await Department.create({
            name: 'General',
            description: 'General Department for all employees'
          });
        }
        
        // Find or create role for the current user role
        let employeeRole = await Role.findOne({ name: userRole });
        if (!employeeRole) {
          employeeRole = await Role.create({
            name: userRole,
            description: `Role for ${userRole}`
          });
        }
        
        // Create new employee if doesn't exist
        employee = await Employee.create({
          fullName: user.fullName,
          email: user.email,
          userId: user._id,
          role: employeeRole._id,
          department: department._id
        });
        console.log(`Created new employee record: ${employee._id}`);
      } else {
        console.log(`Found existing employee record: ${employee._id}`);
      }
      
      // Update employee basic info with new values
      if (updateData.fullName) employee.fullName = updateData.fullName;
      if (updateData.email) employee.email = updateData.email;
      
      // Update employee role if user role changed
      if (updateData.role) {
        // Find or create role for the new role
        let newEmployeeRole = await Role.findOne({ name: updateData.role });
        if (!newEmployeeRole) {
          newEmployeeRole = await Role.create({
            name: updateData.role,
            description: `Role for ${updateData.role}`
          });
        }
        employee.role = newEmployeeRole._id;
      }
      
      // Update all employee fields from form
      if (req.body.phoneNumber !== undefined) employee.phoneNumber = req.body.phoneNumber;
      if (req.body.whatsappNumber !== undefined) employee.whatsappNumber = req.body.whatsappNumber;
      if (req.body.linkedInUrl !== undefined) employee.linkedInUrl = req.body.linkedInUrl;
      if (req.body.currentAddress !== undefined) employee.currentAddress = req.body.currentAddress;
      if (req.body.permanentAddress !== undefined) employee.permanentAddress = req.body.permanentAddress;
      if (req.body.dateOfBirth !== undefined) employee.dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null;
      if (req.body.joiningDate !== undefined) employee.joiningDate = req.body.joiningDate ? new Date(req.body.joiningDate) : null;
      if (req.body.salary !== undefined) employee.salary = req.body.salary ? parseFloat(req.body.salary) : 0;
      if (req.body.status !== undefined) employee.status = req.body.status;
      if (req.body.collegeName !== undefined) employee.collegeName = req.body.collegeName;
      if (req.body.internshipDuration !== undefined) employee.internshipDuration = req.body.internshipDuration ? parseInt(req.body.internshipDuration) : null;
      
      // Update department if provided
      if (req.body.department !== undefined && req.body.department !== '') {
        const department = await Department.findById(req.body.department);
        if (department) {
          employee.department = department._id;
        }
      }
      
      // Update employee role if provided
      if (req.body.employeeRole !== undefined && req.body.employeeRole !== '') {
        const employeeRole = await Role.findById(req.body.employeeRole);
        if (employeeRole) {
          employee.role = employeeRole._id;
        }
      }
      
      // Process uploaded documents using file storage service
      if (req.files) {
        console.log('Processing file uploads in update auth controller:', Object.keys(req.files));
        const documentTypes = ['photograph', 'tenthMarksheet', 'twelfthMarksheet', 'bachelorDegree', 'postgraduateDegree', 'aadharCard', 'panCard', 'pcc', 'resume', 'offerLetter'];
        
        for (const docType of documentTypes) {
          if (req.files[docType] && req.files[docType][0]) {
            const file = req.files[docType][0];
            console.log(`Processing file ${docType} for update:`, {
              originalName: file.originalname,
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path
            });
            
            try {
              const fileStorage = require('../services/fileStorageService');
              console.log(`Calling fileStorage.uploadEmployeeDoc for ${docType}...`);
              const uploaded = await fileStorage.uploadEmployeeDoc(file, docType);
              console.log(`File ${docType} uploaded successfully for update:`, uploaded);
              
              // Store the uploaded file info directly in employee data
              employee[docType] = uploaded;
              console.log(`Stored ${docType} in employee record:`, employee[docType]);
            } catch (fileError) {
              console.error(`Error processing file ${docType} for update:`, fileError);
              console.error(`File error details:`, {
                message: fileError.message,
                stack: fileError.stack
              });
              // Continue with other files if one fails
            }
          }
        }
      } else {
        console.log('No files found in update auth controller request');
      }
      
      console.log('About to save employee with documents:', {
        employeeId: employee._id,
        documents: {
          photograph: !!employee.photograph,
          tenthMarksheet: !!employee.tenthMarksheet,
          aadharCard: !!employee.aadharCard,
          panCard: !!employee.panCard,
          pcc: !!employee.pcc,
          resume: !!employee.resume,
          offerLetter: !!employee.offerLetter
        }
      });
      
      // Use findByIdAndUpdate instead of save() to ensure proper update
      const employeeUpdateData = {};
      
      // Add all the updated fields
      if (employee.fullName) employeeUpdateData.fullName = employee.fullName;
      if (employee.email) employeeUpdateData.email = employee.email;
      if (req.body.phoneNumber !== undefined) employeeUpdateData.phoneNumber = req.body.phoneNumber;
      if (req.body.whatsappNumber !== undefined) employeeUpdateData.whatsappNumber = req.body.whatsappNumber;
      if (req.body.linkedInUrl !== undefined) employeeUpdateData.linkedInUrl = req.body.linkedInUrl;
      if (req.body.currentAddress !== undefined) employeeUpdateData.currentAddress = req.body.currentAddress;
      if (req.body.permanentAddress !== undefined) employeeUpdateData.permanentAddress = req.body.permanentAddress;
      if (req.body.dateOfBirth !== undefined) employeeUpdateData.dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null;
      if (req.body.joiningDate !== undefined) employeeUpdateData.joiningDate = req.body.joiningDate ? new Date(req.body.joiningDate) : null;
      if (req.body.salary !== undefined) employeeUpdateData.salary = req.body.salary ? parseFloat(req.body.salary) : 0;
      if (req.body.status !== undefined) employeeUpdateData.status = req.body.status;
      if (req.body.collegeName !== undefined) employeeUpdateData.collegeName = req.body.collegeName;
      if (req.body.internshipDuration !== undefined) employeeUpdateData.internshipDuration = req.body.internshipDuration ? parseInt(req.body.internshipDuration) : null;
      
      // Add document fields
      if (employee.photograph) employeeUpdateData.photograph = employee.photograph;
      if (employee.tenthMarksheet) employeeUpdateData.tenthMarksheet = employee.tenthMarksheet;
      if (employee.twelfthMarksheet) employeeUpdateData.twelfthMarksheet = employee.twelfthMarksheet;
      if (employee.bachelorDegree) employeeUpdateData.bachelorDegree = employee.bachelorDegree;
      if (employee.postgraduateDegree) employeeUpdateData.postgraduateDegree = employee.postgraduateDegree;
      if (employee.aadharCard) employeeUpdateData.aadharCard = employee.aadharCard;
      if (employee.panCard) employeeUpdateData.panCard = employee.panCard;
      if (employee.pcc) employeeUpdateData.pcc = employee.pcc;
      if (employee.resume) employeeUpdateData.resume = employee.resume;
      if (employee.offerLetter) employeeUpdateData.offerLetter = employee.offerLetter;
      
      console.log('Update data for employee:', employeeUpdateData);
      
      employee = await Employee.findByIdAndUpdate(employee._id, employeeUpdateData, {
        new: true,
        runValidators: true
      });
      
      console.log(`Employee updated successfully with ID: ${employee._id}`);
      
      // Verify the saved employee data
      const savedEmployee = await Employee.findById(employee._id);
      console.log('Saved employee verification:', {
        employeeId: savedEmployee._id,
        documents: {
          photograph: !!savedEmployee.photograph,
          tenthMarksheet: !!savedEmployee.tenthMarksheet,
          aadharCard: !!savedEmployee.aadharCard,
          panCard: !!savedEmployee.panCard,
          pcc: !!savedEmployee.pcc,
          resume: !!savedEmployee.resume,
          offerLetter: !!savedEmployee.offerLetter
        }
      });
    } else {
      console.log(`User role ${userRole} does not require employee record`);
    }

    // Fetch updated employee data if it exists
    let updatedEmployeeData = null;
    if (['Sales Person', 'Lead Person', 'Manager', 'Employee'].includes(userRole)) {
      const Employee = require('../models/Employee');
      updatedEmployeeData = await Employee.findOne({ userId: user._id })
        .populate('department', 'name')
        .populate('role', 'name');
    }

    res.status(200).json({
      success: true,
      data: user,
      employee: updatedEmployeeData
    });
  } catch (err) {
    console.error(`Error updating user with documents: ${err.message}`);
    console.error(`Error stack: ${err.stack}`);
    console.error(`Error details:`, {
      name: err.name,
      code: err.code,
      errors: err.errors
    });
    res.status(400).json({
      success: false,
      message: err.message,
      details: err.errors || err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    console.log('Profile update requested by user:', req.user.id);
    console.log('Request body:', req.body);
    
    const { fullName, email } = req.body;
    
    // Build update object
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    
    // Update password if provided
    if (req.body.password) {
      updateData.password = req.body.password;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for:', email);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpiry;
    await user.save();

    // Send OTP via email
    const emailText = `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`;
    const emailHtml = `
      <h2>Password Reset OTP</h2>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
    `;
    
    await sendEmail(
      email,
      'Password Reset OTP - Traincape CRM',
      emailText,
      emailHtml
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verifyOtp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('OTP verification request:', { email, otp });

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP matches and is not expired
    if (user.verifyOtp !== otp || Date.now() > user.verifyOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Generate reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    console.log('Generating reset OTP:', {
      email,
      resetOtp,
      resetOtpExpiry
    });

    // Save reset OTP
    user.resetOtp = resetOtp;
    user.resetOtpExpireAt = resetOtpExpiry;
    user.verifyOtp = undefined;
    user.verifyOtpExpireAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetOtp
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset_password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetOtp, newPassword } = req.body;

    console.log('Password reset request:', {
      email,
      resetOtp,
      hasPassword: !!newPassword,
      passwordLength: newPassword ? newPassword.length : 0,
      body: req.body
    });

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if reset OTP matches and is not expired
    console.log('Password Reset Validation:', {
      email,
      providedOtp: resetOtp,
      storedOtp: user.resetOtp,
      otpExpiry: new Date(user.resetOtpExpireAt),
      now: new Date(),
      timeDiff: (user.resetOtpExpireAt - Date.now()) / 1000 / 60 + ' minutes',
      password: newPassword ? 'provided' : 'missing',
      passwordLength: newPassword?.length
    });

    if (!user.resetOtp || !user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: 'No reset OTP found. Please request a new password reset.'
      });
    }

    if (user.resetOtp !== resetOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset OTP. Please use the OTP from the verification step.'
      });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      // Clear expired OTPs
      user.resetOtp = undefined;
      user.resetOtpExpireAt = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'Reset OTP has expired. Please request a new password reset.'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    },
  });
};
