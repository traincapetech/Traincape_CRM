import fs from 'fs';
import path from 'path';

// Files to fix
const filesToFix = [
  'client/src/pages/HomePage.jsx',
  'client/src/pages/ProfilePage.jsx',
  'client/src/pages/RepeatCustomersPage.jsx',
  'client/src/pages/ManagerDashboard.jsx',
  'client/src/pages/LeadSalesUpdatePage.jsx',
  'client/src/pages/SalesPage.jsx',
  'client/src/pages/SalesCreatePage.jsx',
  'client/src/pages/TutorialsPage.jsx',
  'client/src/pages/LeadsPage.jsx',
  'client/src/pages/LeadSalesSheet.jsx',
  'client/src/pages/ManagementContactsPage.jsx',
  'client/src/pages/ProspectsPage.jsx',
  'client/src/pages/TokenDebugPage.jsx',
  'client/src/pages/TaskManagementPage.jsx',
  'client/src/pages/TestNotificationsPage.jsx',
  'client/src/pages/AdminLeadsPage.jsx',
  'client/src/pages/AdminReportsPage.jsx',
  'client/src/pages/AdminImportPage.jsx'
];

// Replacement patterns
const replacements = [
  // Background replacements
  {
    pattern: /className="([^"]*?)bg-white(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1bg-white dark:bg-gray-800 transition-colors duration-300$2"',
    description: 'Fix bg-white backgrounds'
  },
  {
    pattern: /className="([^"]*?)bg-gray-50(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1bg-gray-50 dark:bg-gray-700 transition-colors duration-300$2"',
    description: 'Fix bg-gray-50 backgrounds'
  },
  
  // Text color replacements
  {
    pattern: /className="([^"]*?)text-gray-900(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-900 dark:text-white$2"',
    description: 'Fix text-gray-900 colors'
  },
  {
    pattern: /className="([^"]*?)text-gray-700(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-700 dark:text-gray-300$2"',
    description: 'Fix text-gray-700 colors'
  },
  {
    pattern: /className="([^"]*?)text-gray-500(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-500 dark:text-gray-400$2"',
    description: 'Fix text-gray-500 colors'
  },
  {
    pattern: /className="([^"]*?)text-gray-400(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1text-gray-400 dark:text-gray-500$2"',
    description: 'Fix text-gray-400 colors'
  },
  
  // Border replacements
  {
    pattern: /className="([^"]*?)border-gray-200(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1border-gray-200 dark:border-gray-600$2"',
    description: 'Fix border-gray-200 borders'
  },
  {
    pattern: /className="([^"]*?)border-gray-300(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1border-gray-300 dark:border-gray-600$2"',
    description: 'Fix border-gray-300 borders'
  },
  
  // Divide replacements
  {
    pattern: /className="([^"]*?)divide-gray-200(?!\s+dark:)([^"]*?)"/g,
    replacement: 'className="$1divide-gray-200 dark:divide-gray-700$2"',
    description: 'Fix divide-gray-200 dividers'
  }
];

// Function to apply fixes to a file
function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return { fixed: false, changes: 0 };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    
    replacements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        totalChanges += matches.length;
        console.log(`  ✅ ${description}: ${matches.length} changes`);
      }
    });
    
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✨ Fixed ${filePath} - ${totalChanges} total changes`);
      return { fixed: true, changes: totalChanges };
    } else {
      console.log(`✅ ${filePath} - No changes needed`);
      return { fixed: false, changes: 0 };
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return { fixed: false, changes: 0, error: error.message };
  }
}

// Main execution
function main() {
  console.log('🌙 Starting Dark Mode Fix Script...\n');
  
  let totalFiles = 0;
  let fixedFiles = 0;
  let totalChanges = 0;
  
  filesToFix.forEach(file => {
    console.log(`\n📄 Processing: ${file}`);
    totalFiles++;
    
    const result = fixFile(file);
    if (result.fixed) {
      fixedFiles++;
      totalChanges += result.changes;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Dark Mode Fix Complete!');
  console.log(`📊 Summary:`);
  console.log(`   • Total files processed: ${totalFiles}`);
  console.log(`   • Files modified: ${fixedFiles}`);
  console.log(`   • Total changes made: ${totalChanges}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Test the application in both light and dark modes');
  console.log('   2. Check for any remaining styling issues');
  console.log('   3. Verify all pages toggle correctly');
  console.log('   4. Test modals, forms, and interactive components');
}

// Run the script
main();

export { fixFile, replacements, filesToFix }; 