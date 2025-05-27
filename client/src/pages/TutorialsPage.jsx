import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";

const TutorialsPage = () => {
  const { user } = useAuth();
  const [activeTutorial, setActiveTutorial] = useState("getting-started");
  
  // Tutorial categories and their respective content
  const tutorials = {
    "getting-started": {
      title: "Getting Started with TrainCape CRM",
      icon: "🚀",
      content: [
        {
          heading: "Welcome to TrainCape CRM",
          description: "This tutorial will help you understand the basics of the CRM system and how to get started.",
          steps: [
            "Log in using your provided credentials",
            "Navigate the dashboard to understand available features",
            "Update your profile information",
            "Explore the main navigation menu for your role-specific features"
          ],
          image: "dashboard.png",
          tip: "Your role determines which features you can access. The system has four roles: Admin, Manager, Lead Person, and Sales Person."
        },
        {
          heading: "Understanding Your Dashboard",
          description: "Your dashboard provides quick access to important information based on your role.",
          steps: [
            "View recent activities and updates",
            "Access quick shortcuts to common tasks",
            "Check pending tasks and notifications",
            "Use the quick stats cards to monitor performance"
          ],
          tip: "Customize your experience by updating your profile settings."
        },
        {
          heading: "Setting Up Your Profile",
          description: "Personalize your account and add a profile picture.",
          steps: [
            "Navigate to your profile by clicking your name in the top navigation",
            "Upload a profile picture by clicking the camera icon",
            "Use the crop tool to adjust and position your image",
            "Click Apply Crop to confirm your selection",
            "Save your profile changes"
          ],
          tip: "The new image cropping tool allows you to perfectly position your profile picture before uploading."
        }
      ]
    },
    "lead-management": {
      title: "Lead Management",
      icon: "👥",
      content: [
        {
          heading: "Creating New Leads",
          description: "Learn how to add new potential customers to the system.",
          steps: [
            "Navigate to the Leads section from the main menu",
            "Click the 'Add New Lead' button in the top right corner",
            "Fill in all required fields (marked with *)",
            "For optional fields like email, include information when available",
            "Click 'Save Lead' to create the new entry"
          ],
          tip: "Always include as much information as possible, but email is now optional to accommodate clients who prefer phone contact."
        },
        {
          heading: "Managing Existing Leads",
          description: "How to update, filter, and organize your lead database.",
          steps: [
            "Use the search bar to quickly find leads by name, email, or phone",
            "Click on any lead to view detailed information",
            "Use the edit button to update lead information",
            "Add feedback notes to track communication history"
          ],
          tip: "Regular updates to lead information ensures everyone has the most current data."
        },
        {
          heading: "Assigning Leads to Sales Persons",
          description: "Proper lead assignment ensures timely follow-up.",
          steps: [
            "From the lead details page, click 'Edit'",
            "Use the 'SALE PERSON' dropdown to select the appropriate sales person",
            "Save the changes to notify the sales person of the new assignment"
          ],
          tip: "Consider workload balance when assigning leads to ensure timely follow-up."
        }
      ]
    },
    "sales-tracking": {
      title: "Sales Tracking & Management",
      icon: "💰",
      content: [
        {
          heading: "Converting Leads to Sales",
          description: "Learn the process of turning qualified leads into sales records.",
          steps: [
            "Navigate to your assigned leads list",
            "Update the lead status to 'Qualified' when appropriate",
            "Click 'Convert to Sale' to begin the sales process",
            "Fill in the required sales information including course details and pricing",
            "Select the appropriate currency for the transaction"
          ],
          tip: "The system now supports multiple currencies for both Total Cost and Token Amount fields."
        },
        {
          heading: "Creating Reference Sales",
          description: "Reference sales allow you to track customers who came through referrals rather than the standard lead process.",
          steps: [
            "From the Sales page, toggle the 'Reference Sale' switch",
            "Select a Lead Person who referred this customer (optional)",
            "Fill in all customer information as this will not be pulled from an existing lead",
            "Complete all required sales information",
            "Submit the form to create the reference sale"
          ],
          tip: "Reference sales customers will be available in all customer selection dropdowns throughout the system, including exam scheduling."
        },
        {
          heading: "Lead Person Sales Management",
          description: "Lead persons can now track their own sales separately from the main sales pipeline.",
          steps: [
            "As a Lead Person, navigate to the Lead Sales Update page",
            "Click 'Add New Sale' to create a new lead person sale",
            "Fill in all required customer and sales information",
            "Select a Sales Person to associate with this sale",
            "Submit the sale to save it to the lead person sales database"
          ],
          tip: "Lead Person sales are stored in a separate database and are only visible to Lead Persons, Managers, and Admins - not to regular Sales Persons."
        },
        {
          heading: "Managing Your Sales",
          description: "Sales Persons can now fully edit and update their own sales records.",
          steps: [
            "Navigate to the Sales Tracking page to see all your assigned sales",
            "Click the edit icon on any sale you created",
            "Update any field as needed - you now have full editing privileges for your own sales",
            "Save your changes to update the record"
          ],
          tip: "While you can edit all aspects of your own sales, you'll still need an Admin or Manager to delete records if necessary."
        },
        {
          heading: "Using the Sales Sheet",
          description: "The Lead Sales Sheet provides a comprehensive view of all sales data.",
          steps: [
            "Access the Lead Sales Sheet from the navigation menu",
            "Use filters to narrow down sales by date range, sales person, or other criteria",
            "Click on column headers to sort the data",
            "Export data to Excel for reporting purposes",
            "Use inline editing for quick updates"
          ],
          tip: "The sales sheet now includes email information and improved contact details for better customer tracking."
        },
        {
          heading: "Managing Payments & Tracking",
          description: "Track payments and outstanding balances effectively.",
          steps: [
            "Record token (initial) payments when received",
            "Update payment status as transactions are completed",
            "Monitor pending payments through the Sales Tracking page",
            "Set follow-up tasks for payment collection"
          ],
          tip: "Keep the payment currency consistent with the original sale for accurate accounting."
        }
      ]
    },
    "task-management": {
      title: "Task & Exam Management",
      icon: "📋",
      content: [
        {
          heading: "Scheduling Exams",
          description: "Use the Task Management system to schedule and track exams for your customers.",
          steps: [
            "Navigate to the Task Management page",
            "Click 'Schedule New Exam' button",
            "Enter the exam title and description",
            "Select a customer from the dropdown (includes both leads and reference customers)",
            "Set the exam date and time",
            "Save to create the scheduled exam"
          ],
          tip: "The customer dropdown now includes both regular leads and reference sales customers, giving you a complete list of all possible candidates."
        },
        {
          heading: "Managing Scheduled Exams",
          description: "Track and update exam status as they progress.",
          steps: [
            "View all scheduled exams on the Task Management page",
            "Use color-coding to quickly identify exam status (pending, completed, overdue)",
            "Click 'Mark Complete' when an exam has been conducted",
            "Edit or reschedule exams as needed using the edit icon",
            "Delete exams that are no longer needed"
          ],
          tip: "Keep the exam list up to date to ensure nothing falls through the cracks."
        },
        {
          heading: "Exam Follow-up Process",
          description: "Proper follow-up after exams increases conversion rates.",
          steps: [
            "After marking an exam as completed, update the related lead or sale with results",
            "Schedule any necessary follow-up tasks",
            "Document exam outcomes in the lead feedback or sales notes",
            "Update the lead status based on exam performance"
          ],
          tip: "Regular communication after exams builds trust and increases the likelihood of enrollment."
        }
      ]
    },
    "admin-features": {
      title: "Admin & Management Tools",
      icon: "⚙️",
      content: [
        {
          heading: "User Management",
          description: "Admin users can manage system access and roles.",
          steps: [
            "Navigate to Admin > Manage Users",
            "Create new user accounts with appropriate role assignments",
            "Edit existing user information or reset passwords",
            "Deactivate accounts when necessary"
          ],
          tip: "Review user activity logs periodically to ensure proper system usage."
        },
        {
          heading: "Data Import & Export",
          description: "Efficiently move data in and out of the CRM.",
          steps: [
            "Go to Admin > Import Data",
            "Use the template provided for data formatting",
            "Upload your CSV file with lead or sales information",
            "Review and confirm the data mapping",
            "Process the import and check for any errors"
          ],
          tip: "Always make a backup export before performing large imports or system changes."
        },
        {
          heading: "Permission Management",
          description: "Configure role-based permissions for different user types.",
          steps: [
            "Access the Admin Dashboard",
            "Review current permission settings for each role",
            "Adjust permissions as needed for your organization's workflows",
            "Test permission changes with test accounts before rolling out"
          ],
          tip: "The system now allows Sales Persons to fully edit their own sales while maintaining appropriate restrictions on other users' data."
        },
        {
          heading: "System Configuration",
          description: "Customize the CRM to fit your organization's needs.",
          steps: [
            "Access the Admin Dashboard",
            "Configure notification preferences",
            "Set up automated processes for lead assignment",
            "Customize sales stages and lead statuses"
          ],
          tip: "Document any configuration changes for future reference."
        }
      ]
    },
    "best-practices": {
      title: "CRM Best Practices",
      icon: "🌟",
      content: [
        {
          heading: "Data Quality Management",
          description: "Maintaining high-quality data is essential for CRM success.",
          steps: [
            "Regularly update lead and customer information",
            "Remove duplicate records when identified",
            "Use consistent naming conventions",
            "Verify contact information periodically"
          ],
          tip: "Schedule regular data cleaning sessions to maintain database quality."
        },
        {
          heading: "Managing Reference Customers",
          description: "Reference customers require special attention for ongoing relationship management.",
          steps: [
            "Properly tag all reference customers when creating sales",
            "Document the source of the reference in notes",
            "Thank referrers for their recommendations",
            "Provide special attention to reference customers to encourage additional referrals",
            "Track conversion rates from references versus other lead sources"
          ],
          tip: "Reference customers often have higher conversion rates and retention, so track them separately in your analytics."
        },
        {
          heading: "Effective Follow-up Strategies",
          description: "Consistent follow-up improves conversion rates.",
          steps: [
            "Document all customer interactions in the CRM",
            "Set follow-up tasks with clear deadlines",
            "Use templates for common follow-up communications",
            "Analyze response patterns to optimize timing"
          ],
          tip: "The 'CLIENT REMARK' and 'FEEDBACK' fields are ideal for tracking communication history."
        },
        {
          heading: "Reporting & Analytics",
          description: "Leverage data insights for better decision-making.",
          steps: [
            "Use the built-in reporting tools to track performance",
            "Export data for detailed analysis when needed",
            "Track conversion rates from lead to sale",
            "Monitor sales team performance metrics",
            "Compare performance between regular leads and reference customers"
          ],
          tip: "Regular reporting helps identify trends and opportunities for improvement."
        }
      ]
    }
  };
  
  // Render tutorial section based on active selection
  const renderTutorial = () => {
    const tutorial = tutorials[activeTutorial];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">{tutorial.icon}</span>
          <h2 className="text-2xl font-bold text-gray-800">{tutorial.title}</h2>
        </div>
        
        <div className="space-y-8">
          {tutorial.content.map((section, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">{section.heading}</h3>
              <p className="text-gray-700 mb-4">{section.description}</p>
              
              {section.steps && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-700">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="ml-2">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {section.image && (
                <div className="my-4 border border-gray-200 rounded-md p-2 bg-gray-50 text-center">
                  <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-500">
                    [Image: {section.image}]
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Screenshot reference</p>
                </div>
              )}
              
              {section.tip && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-blue-700">{section.tip}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Tutorials</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn how to use TrainCape CRM effectively with these step-by-step tutorials.
              Select a category below to get started.
            </p>
          </div>
          
          {/* Tutorial Navigation and Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tutorial Navigation Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Tutorial Topics</h3>
                <nav>
                  <ul className="space-y-2">
                    {Object.keys(tutorials).map((key) => (
                      <li key={key}>
                        <button
                          onClick={() => setActiveTutorial(key)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            activeTutorial === key
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="mr-2">{tutorials[key].icon}</span>
                          {tutorials[key].title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                {/* Role-specific tutorials notice */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Your Role</h4>
                  <p className="text-sm text-gray-600">
                    {user ? (
                      <>
                        You are logged in as: <span className="font-medium">{user.role}</span>
                        <br />
                        Tutorials are tailored to features available to your role.
                      </>
                    ) : (
                      <>
                        You are not logged in. Some advanced features may require authentication.
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Quick Help */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 rounded-lg shadow-md mt-4">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-sm mb-3">
                  Can't find what you're looking for? Contact our support team for assistance.
                </p>
                <Link to="/support" className="inline-block bg-white text-purple-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition">
                  Contact Support
                </Link>
              </div>
            </div>
            
            {/* Tutorial Content */}
            <div className="md:w-3/4">
              {renderTutorial()}
              
              {/* Tutorial Navigation */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    const keys = Object.keys(tutorials);
                    const currentIndex = keys.indexOf(activeTutorial);
                    if (currentIndex > 0) {
                      setActiveTutorial(keys[currentIndex - 1]);
                    }
                  }}
                  disabled={Object.keys(tutorials).indexOf(activeTutorial) === 0}
                  className={`px-4 py-2 flex items-center rounded-md ${
                    Object.keys(tutorials).indexOf(activeTutorial) === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Topic
                </button>
                
                <button
                  onClick={() => {
                    const keys = Object.keys(tutorials);
                    const currentIndex = keys.indexOf(activeTutorial);
                    if (currentIndex < keys.length - 1) {
                      setActiveTutorial(keys[currentIndex + 1]);
                    }
                  }}
                  disabled={Object.keys(tutorials).indexOf(activeTutorial) === Object.keys(tutorials).length - 1}
                  className={`px-4 py-2 flex items-center rounded-md ${
                    Object.keys(tutorials).indexOf(activeTutorial) === Object.keys(tutorials).length - 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  Next Topic
                  <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional Resources */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Additional Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-500">
                <h3 className="font-bold text-lg mb-2">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch step-by-step demonstrations of key CRM features.</p>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                  Watch now
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-green-500">
                <h3 className="font-bold text-lg mb-2">FAQ Database</h3>
                <p className="text-gray-600 mb-4">Find answers to commonly asked questions about the CRM.</p>
                <a href="#" className="text-green-600 hover:text-green-800 font-medium inline-flex items-center">
                  View FAQs
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-purple-500">
                <h3 className="font-bold text-lg mb-2">Feature Updates</h3>
                <p className="text-gray-600 mb-4">Stay informed about the latest CRM features and enhancements.</p>
                <a href="#" className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center">
                  Read changelog
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorialsPage; 