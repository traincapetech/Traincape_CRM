const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create PDF
const doc = new PDFDocument({
  size: 'A4',
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }
});

// Pipe to file
doc.pipe(fs.createWriteStream('Complete_CRM_System_Guide.pdf'));

// Title Page
doc.fontSize(24).text('CRM System Guide', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('Complete Technical Documentation', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Traincape Technology', { align: 'center' });
doc.text(new Date().toLocaleDateString(), { align: 'center' });
doc.moveDown(2);

// Table of Contents
doc.addPage();
doc.fontSize(16).text('Table of Contents', { underline: true });
doc.moveDown();
doc.fontSize(12);
doc.text('1. System Overview');
doc.text('2. Page Connectivity Diagram');
doc.text('3. API Flow Diagram');
doc.text('4. Database Schema');
doc.text('5. Detailed Component Explanations');
doc.text('6. Code Examples');
doc.moveDown(2);

// 1. System Overview
doc.addPage();
doc.fontSize(16).text('1. System Overview', { underline: true });
doc.moveDown();
doc.fontSize(12).text('Our CRM system consists of the following main modules:');
doc.moveDown();
doc.text('• Authentication System (Login/Register)');
doc.text('• Employee Management');
doc.text('• Payroll System');
doc.text('• Chat System');
doc.moveDown();

// 2. Page Connectivity
doc.addPage();
doc.fontSize(16).text('2. Page Connectivity', { underline: true });
doc.moveDown();
doc.fontSize(12).text('Frontend Pages and Their Connections:');
doc.moveDown();

// Login Flow
doc.fontSize(14).text('Login Flow:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('LoginPage.jsx');
doc.text('↓');
doc.text('AuthContext.jsx (Manages authentication state)');
doc.text('↓');
doc.text('DashboardPage.jsx (After successful login)');
doc.moveDown();

// Employee Flow
doc.fontSize(14).text('Employee Management Flow:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('EmployeePage.jsx');
doc.text('├── EmployeeList.jsx (Shows all employees)');
doc.text('├── EmployeeForm.jsx (Add/Edit employee)');
doc.text('└── EmployeeDetail.jsx (View employee details)');
doc.moveDown();

// Payroll Flow
doc.fontSize(14).text('Payroll System Flow:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('PayrollPage.jsx');
doc.text('├── PayrollList.jsx (All payroll records)');
doc.text('├── PayrollGenerate.jsx (Generate new payroll)');
doc.text('└── PayrollDetail.jsx (View/Download slip)');
doc.moveDown();

// 3. API Flow
doc.addPage();
doc.fontSize(16).text('3. API Flow', { underline: true });
doc.moveDown();

// Authentication APIs
doc.fontSize(14).text('Authentication APIs:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('POST /api/auth/login');
doc.text('└── auth.controller.js → validateUser() → generateToken()');
doc.moveDown();
doc.text('POST /api/auth/register');
doc.text('└── auth.controller.js → createUser() → sendWelcomeEmail()');
doc.moveDown();

// Employee APIs
doc.fontSize(14).text('Employee APIs:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('GET /api/employees');
doc.text('└── employee.controller.js → findAll() → paginateResults()');
doc.moveDown();
doc.text('POST /api/employees');
doc.text('└── employee.controller.js → create() → validateData()');
doc.moveDown();

// Payroll APIs
doc.fontSize(14).text('Payroll APIs:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('POST /api/payroll/generate');
doc.text('└── payroll.controller.js → calculateSalary() → generatePDF()');
doc.moveDown();
doc.text('GET /api/payroll/:id/salary-slip');
doc.text('└── payroll.controller.js → findPayroll() → createPDF()');
doc.moveDown();

// 4. Database Schema
doc.addPage();
doc.fontSize(16).text('4. Database Schema', { underline: true });
doc.moveDown();

// User Schema
doc.fontSize(14).text('User Schema:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('const userSchema = {');
doc.text('  email: String (required, unique),');
doc.text('  password: String (hashed),');
doc.text('  role: String (Admin/HR/Manager/Employee),');
doc.text('  lastLogin: Date,');
doc.text('  status: String (Active/Inactive)');
doc.text('}');
doc.moveDown();

// Employee Schema
doc.fontSize(14).text('Employee Schema:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('const employeeSchema = {');
doc.text('  userId: ObjectId (ref: User),');
doc.text('  fullName: String,');
doc.text('  department: String,');
doc.text('  designation: String,');
doc.text('  salary: Number');
doc.text('}');
doc.moveDown();

// Payroll Schema
doc.fontSize(14).text('Payroll Schema:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('const payrollSchema = {');
doc.text('  employeeId: ObjectId (ref: Employee),');
doc.text('  month: Number (1-12),');
doc.text('  year: Number,');
doc.text('  baseSalary: Number,');
doc.text('  daysPresent: Number,');
doc.text('  calculatedSalary: Number');
doc.text('}');
doc.moveDown();

// 5. Component Details
doc.addPage();
doc.fontSize(16).text('5. Detailed Component Explanations', { underline: true });
doc.moveDown();

// PayrollComponent
doc.fontSize(14).text('PayrollComponent Workflow:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('1. User Input');
doc.text('   • Enter base salary');
doc.text('   • Enter days present');
doc.text('   • Select month/year');
doc.moveDown();
doc.text('2. Calculation');
doc.text('   • Always use 30 days as base');
doc.text('   • Formula: (baseSalary / 30) * daysPresent');
doc.text('   • Example: (30000 / 30) * 25 = 25000');
doc.moveDown();
doc.text('3. PDF Generation');
doc.text('   • Size limit: 10KB - 20KB');
doc.text('   • Includes company logo');
doc.text('   • Shows salary breakdown');
doc.moveDown();

// ChatComponent
doc.fontSize(14).text('ChatComponent Workflow:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('1. Message Flow');
doc.text('   • User types message');
doc.text('   • Socket.IO emits to server');
doc.text('   • Server broadcasts to recipients');
doc.text('   • Recipients play notification');
doc.moveDown();
doc.text('2. Notification System');
doc.text('   • WhatsApp-style sounds');
doc.text('   • Browser notifications');
doc.text('   • Unread message count');
doc.moveDown();

// 6. Code Examples
doc.addPage();
doc.fontSize(16).text('6. Code Examples', { underline: true });
doc.moveDown();

// Salary Calculation
doc.fontSize(14).text('Salary Calculation:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('// Frontend calculation');
doc.text('const calculateSalary = (baseSalary, daysPresent) => {');
doc.text('  return (baseSalary / 30) * daysPresent;');
doc.text('};');
doc.moveDown();
doc.text('// Example usage');
doc.text('const salary = calculateSalary(30000, 25);');
doc.text('// Result: 25000 (for 25 days present)');
doc.moveDown();

// PDF Generation
doc.fontSize(14).text('PDF Generation:', { underline: true });
doc.moveDown();
doc.fontSize(10);
doc.text('const generatePDF = (data) => {');
doc.text('  const doc = new PDFDocument();');
doc.text('  let size = 0;');
doc.text('  doc.on("data", chunk => {');
doc.text('    size += chunk.length;');
doc.text('    if (size > 20480) {');
doc.text('      throw new Error("PDF too large");');
doc.text('    }');
doc.text('  });');
doc.text('};');
doc.moveDown();

// Footer
doc.fontSize(10);
doc.text('Generated: ' + new Date().toLocaleString(), { align: 'center' });
doc.text('Traincape Technology CRM System', { align: 'center' });

// Finish PDF
doc.end();

console.log('PDF generated successfully: Complete_CRM_System_Guide.pdf'); 