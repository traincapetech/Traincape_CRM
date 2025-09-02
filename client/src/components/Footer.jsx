import React from "react";
import { Link } from "react-router-dom";
import {
  FaLinkedin,
  FaFacebook,
  FaEnvelope,
  FaRocket,
  FaChartLine,
  FaTasks,
  FaChartBar,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Branding */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              TrainCape CRM
            </h3>
            <p className="text-gray-400 text-sm">
              Empowering sales teams with intelligent CRM solutions.
            </p>
          </div>

          {/* Features - centered */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-4 mr-12 text-white">Features</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link
                  to="/leads"
                  className="hover:text-white transition flex items-center"
                >
                  <FaRocket className="mr-2 text-sm" /> Lead Management
                </Link>
              </li>
              <li>
                <Link
                  to="/sales"
                  className="hover:text-white transition flex items-center"
                >
                  <FaChartLine className="mr-2 text-sm" /> Sales Pipeline
                </Link>
              </li>
              <li>
                <Link
                  to="/tasks"
                  className="hover:text-white transition flex items-center"
                >
                  <FaTasks className="mr-2 text-sm" /> Task Management
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/analytics"
                  className="hover:text-white transition flex items-center"
                >
                  <FaChartBar className="mr-2 text-sm" /> Analytics
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Documentation
                </a>
              </li>
              {/* <li>
                <a href="#" className="hover:text-white transition">
                  Help Center
                </a>
              </li> */}
              <li>
                <a href="#tutorials" className="hover:text-white transition">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#countries" className="hover:text-white transition">
                  Countries
                </a>
              </li>
            </ul>
          </div>

          {/* Company + Social Icons inline */}
         {/* Company + Connect */}
<div>
  <div className="flex flex-row items-start justify-between">
    {/* Left: Company Links */}
    <div className="mr-6">
      <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
      <ul className="space-y-3 text-gray-400 text-sm">
        <li>
          <a href="https://traincapetech.in/about-us" className="hover:text-white transition">About Us</a>
        </li>
        <li>
          <a href="https://traincapetech.in/Career-details" className="hover:text-white transition">Careers</a>
        </li>
        <li>
          <a href="#management-contacts" className="hover:text-white transition">Contact</a>
        </li>
      </ul>
    </div>

    {/* Right: Vertical Social Icons */}
    <div>
      <h4 className="text-lg font-semibold mb-3 text-white">Connect</h4>
      <div className="flex flex-col ml-2">
        <a
          href="https://www.linkedin.com/company/traincape-technology/"
          className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-blue-400 w-fit"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="#"
          className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-blue-900 w-fit"
          aria-label="Facebook"
        >
          <FaFacebook />
        </a>
        <a
          href="mailto:sales@traincapetech.in"
          className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-red-600 w-fit"
          aria-label="Email"
        >
          <FaEnvelope />
        </a>
      </div>
    </div>
  </div>
</div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TrainCape CRM. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;