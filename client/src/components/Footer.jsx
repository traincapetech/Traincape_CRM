import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">CRM Platform</h3>
            <p className="text-gray-400 mt-1">Streamlining your business relationships</p>
          </div>
          
          <div className="flex space-x-8">
            <div>
              <h4 className="font-semibold mb-2">Resources</h4>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#tutorials" className="text-gray-400 hover:text-white transition">Tutorials</a></li>
                <li><a href="#countries" className="text-gray-400 hover:text-white transition">Countries</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Company</h4>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#management-contacts" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} CRM Platform. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
