import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter, FaFacebook, FaRocket, FaChartLine, FaTasks, FaChartBar } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-4">TrainCape CRM</h3>
            <p className="text-gray-400">Empowering sales teams with intelligent CRM solutions.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/leads" className="hover:text-white transition flex items-center">
                  <FaRocket className="mr-2" />Lead Management
                </Link>
              </li>
              <li>
                <Link to="/sales" className="hover:text-white transition flex items-center">
                  <FaChartLine className="mr-2" />Sales Pipeline
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="hover:text-white transition flex items-center">
                  <FaTasks className="mr-2" />Task Management
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-white transition flex items-center">
                  <FaChartBar className="mr-2" />Analytics
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Help Center</a>
              </li>
              <li>
                <a href="#tutorials" className="hover:text-white transition">Tutorials</a>
              </li>
              <li>
                <a href="#countries" className="hover:text-white transition">Countries</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Careers</a>
              </li>
              <li>
                <a href="#management-contacts" className="hover:text-white transition">Contact</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                  <FaLinkedin />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                  <FaTwitter />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                  <FaFacebook />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} TrainCape CRM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;