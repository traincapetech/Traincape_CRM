const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate PDF directly
const doc = new PDFDocument();
const filename = 'CRM_Project_Documentation.pdf';

// Pipe to file
doc.pipe(fs.createWriteStream(filename));

// Title
doc.fontSize(14).text('CRM PROJECT DOCUMENTATION', { align: 'center' });
doc.moveDown(0.5);

// 1. Authentication System
doc.fontSize(10).text('1. AUTHENTICATION SYSTEM', { underline: true });
doc.fontSize(8);
doc.text('• Login/Register with email verification');
doc.text('• JWT token-based authentication');
doc.text('• Role-based access (Admin, HR, Manager, Employee)');
doc.text('• Password reset functionality');
doc.moveDown(0.5);

// 2. Employee Management
doc.fontSize(10).text('2. EMPLOYEE MANAGEMENT', { underline: true });
doc.fontSize(8);
doc.text('• Employee profiles with personal/professional details');
doc.text('• Department assignment and role management');
doc.text('• Document upload/verification system');
doc.text('• Attendance tracking with status updates');
doc.moveDown(0.5);

// 3. Payroll System
doc.fontSize(10).text('3. PAYROLL SYSTEM', { underline: true });
doc.fontSize(8);
doc.text('• Monthly salary calculation (30 days base)');
doc.text('• Attendance-based salary proration');
doc.text('• Allowances and deductions management');
doc.text('• PDF salary slip generation (10KB-20KB)');
doc.text('• Approval workflow (Draft → Approved → Paid)');
doc.moveDown(0.5);

// 4. Chat System
doc.fontSize(10).text('4. CHAT SYSTEM', { underline: true });
doc.fontSize(8);
doc.text('• Real-time messaging using Socket.IO');
doc.text('• WhatsApp-style notification sounds');
doc.text('• User online/offline status');
doc.text('• Message history and chat persistence');
doc.text('• Sound preference management');
doc.moveDown(0.5);

// 5. Technical Stack
doc.fontSize(10).text('5. TECHNICAL STACK', { underline: true });
doc.fontSize(8);
doc.text('Frontend:');
doc.text('• React.js with Context API');
doc.text('• Socket.IO Client');
doc.text('• Web Audio API for notifications');
doc.text('• React Icons and modern UI components');
doc.moveDown(0.3);

doc.text('Backend:');
doc.text('• Node.js + Express.js');
doc.text('• MongoDB (Free Tier)');
doc.text('• Socket.IO Server');
doc.text('• JWT Authentication');
doc.moveDown(0.3);

doc.text('Features:');
doc.text('• Real-time updates');
doc.text('• File size optimization');
doc.text('• Responsive design');
doc.text('• Error handling and logging');
doc.moveDown(0.5);

// 6. API Endpoints
doc.fontSize(10).text('6. KEY API ENDPOINTS', { underline: true });
doc.fontSize(8);
doc.text('Authentication:');
doc.text('• POST /api/auth/login');
doc.text('• POST /api/auth/register');
doc.moveDown(0.3);

doc.text('Payroll:');
doc.text('• POST /api/payroll/generate');
doc.text('• PUT /api/payroll/:id');
doc.text('• GET /api/payroll/:id/salary-slip');
doc.moveDown(0.3);

doc.text('Employees:');
doc.text('• GET /api/employees');
doc.text('• POST /api/employees');
doc.text('• PUT /api/employees/:id');
doc.moveDown(0.5);

// 7. Future Enhancements
doc.fontSize(10).text('7. PLANNED ENHANCEMENTS', { underline: true });
doc.fontSize(8);
doc.text('• Advanced reporting system');
doc.text('• Leave management integration');
doc.text('• Performance review module');
doc.text('• Mobile app development');
doc.moveDown(0.5);

// Footer
doc.fontSize(7);
doc.text('Generated: ' + new Date().toLocaleString(), { align: 'center' });
doc.text('Traincape Technology CRM System', { align: 'center' });

// Finish PDF
doc.end();

console.log(`PDF generated successfully: ${filename}`); 