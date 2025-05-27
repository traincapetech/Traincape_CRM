import React from "react";
import Layout from "../components/Layout/Layout";
import { FaEnvelope, FaPhoneAlt, FaLinkedin, FaUser, FaUserTie, FaCode, FaHeadset } from "react-icons/fa";

const ManagementContactsPage = () => {
  // Management contacts data
  const contacts = [
    {
      id: 1,
      name: "Parichay Singh",
      position: "CEO & Founder",
      email: "sales@traincapetech.info",
      phone: "+91 6280281505",
      linkedin: "https://www.linkedin.com/in/parichay-singh-rana?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B%2BLVd4W1EQj2KhxGQFwlQuQ%3D%3D",
      image: "https://i.pravatar.cc/300?img=11",
      icon: <FaUserTie className="text-3xl text-blue-700" />
    },
    {
      id: 2,
      name: "Shivam Singh",
      position: "Operations Manager",
      email: "shivam@traincapetech.in",
      phone: "+91 9354364160",
      // linkedin: "https://linkedin.com/in/janesmith",
      image: "https://i.pravatar.cc/300?img=13",
      icon: <FaUser className="text-3xl text-green-600" />
    },
    {
      id: 3,
      name: "Saurav Kumar",
      position: "Technical Lead",
      email: "saurav@traincapetech.in",
      phone: "+62 852-8223-3601",
      // linkedin: "https://linkedin.com/in/michaeljohnson",
      image: "https://i.pravatar.cc/300?img=12",
      icon: <FaCode className="text-3xl text-purple-600" />
    },
    // {
    //   id: 4,
    //   name: "Lisa Brown",
    //   position: "Customer Support Manager",
    //   email: "support@traincapetech.com",
    //   phone: "+1 (123) 456-7893",
    //   linkedin: "https://linkedin.com/in/lisabrown",
    //   image: "https://i.pravatar.cc/300?img=10",
    //   icon: <FaHeadset className="text-3xl text-red-600" />
    // }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-10">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Management Contacts</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Meet our leadership team at TrainCape Technology. Reach out to us directly for any questions or inquiries.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="bg-gray-100 p-6 flex justify-center">
                {contact.image ? (
                  <img 
                    src={contact.image} 
                    alt={contact.name} 
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                    {contact.icon || <FaUser className="text-4xl text-blue-600" />}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{contact.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{contact.position}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaEnvelope className="text-blue-600 mr-3" />
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <FaPhoneAlt className="text-blue-600 mr-3" />
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      {contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <FaLinkedin className="text-blue-600 mr-3" />
                    <a 
                      href={contact.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">General Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Main Office</h3>
              <p className="text-gray-600 mb-1">123 Tech Boulevard</p>
              <p className="text-gray-600 mb-1">Suite 456</p>
              <p className="text-gray-600 mb-1">San Francisco, CA 94105</p>
              <p className="text-gray-600">United States</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Contact Details</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">General Inquiries:</span> info@traincapetech.com
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Customer Support:</span> support@traincapetech.com
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Phone:</span> +1 (123) 456-7800
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Working Hours:</span> Monday-Friday, 9AM-6PM PST
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-700 mb-3">Send Us a Message</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-700">
                For any questions or inquiries, please feel free to reach out to our team through the contact information provided above.
                We strive to respond to all messages within 24 business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagementContactsPage; 