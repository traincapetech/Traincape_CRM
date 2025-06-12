import fs from 'fs';
import path from 'path';

// Professional dark mode replacements following industry standards
const professionalReplacements = [
  // Replace amateur gray-800 backgrounds with professional dark colors
  {
    pattern: /bg-white dark:bg-gray-800/g,
    replacement: 'bg-white dark:bg-slate-900',
    description: 'Upgrade card backgrounds to professional slate-900'
  },
  
  // Replace basic gray-700 with sophisticated slate-800
  {
    pattern: /bg-gray-50 dark:bg-gray-700/g,
    replacement: 'bg-gray-50 dark:bg-slate-800',
    description: 'Upgrade secondary backgrounds to slate-800'
  },
  
  // Professional text colors - better contrast and readability
  {
    pattern: /text-gray-900 dark:text-white/g,
    replacement: 'text-slate-900 dark:text-slate-100',
    description: 'Upgrade heading text to professional slate colors'
  },
  
  {
    pattern: /text-gray-700 dark:text-gray-300/g,
    replacement: 'text-slate-700 dark:text-slate-300',
    description: 'Upgrade body text to professional slate colors'
  },
  
  {
    pattern: /text-gray-500 dark:text-gray-400/g,
    replacement: 'text-slate-500 dark:text-slate-400',
    description: 'Upgrade muted text to professional slate colors'
  },
  
  // Professional borders - subtle but visible
  {
    pattern: /border-gray-200 dark:border-gray-600/g,
    replacement: 'border-slate-200 dark:border-slate-700',
    description: 'Upgrade borders to professional slate colors'
  },
  
  {
    pattern: /border-gray-300 dark:border-gray-600/g,
    replacement: 'border-slate-300 dark:border-slate-600',
    description: 'Upgrade input borders to professional slate colors'
  },
  
  // Professional dividers
  {
    pattern: /divide-gray-200 dark:divide-gray-700/g,
    replacement: 'divide-slate-200 dark:divide-slate-700',
    description: 'Upgrade dividers to professional slate colors'
  },
  
  // Improve transitions - make them more sophisticated
  {
    pattern: /transition-colors duration-300/g,
    replacement: 'transition-all duration-200 ease-out',
    description: 'Upgrade to professional transitions'
  },
  
  // Professional shadows for dark mode
  {
    pattern: /shadow-md/g,
    replacement: 'shadow-md dark:shadow-xl dark:shadow-black/25',
    description: 'Add professional dark mode shadows'
  },
  
  {
    pattern: /shadow-lg/g,
    replacement: 'shadow-lg dark:shadow-2xl dark:shadow-black/25',
    description: 'Add professional large shadows for dark mode'
  },
  
  // Professional hover states
  {
    pattern: /hover:bg-gray-50/g,
    replacement: 'hover:bg-slate-50 dark:hover:bg-slate-800',
    description: 'Add professional hover states'
  },
  
  {
    pattern: /hover:bg-gray-100/g,
    replacement: 'hover:bg-slate-100 dark:hover:bg-slate-700',
    description: 'Add professional hover states'
  }
];

// Files to upgrade to professional standards
const filesToUpgrade = [
  'client/src/pages/HomePage.jsx',
  'client/src/pages/AdminDashboardPage.jsx',
  'client/src/pages/SalesTrackingPage.jsx',
  'client/src/pages/ProfilePage.jsx',
  'client/src/pages/AdminLeadsPage.jsx',
  'client/src/pages/AdminReportsPage.jsx',
  'client/src/pages/SalesPage.jsx',
  'client/src/pages/LeadsPage.jsx',
  'client/src/pages/ManagerDashboard.jsx',
  'client/src/pages/TaskManagementPage.jsx',
  'client/src/pages/ProspectsPage.jsx',
  'client/src/pages/RepeatCustomersPage.jsx',
  'client/src/pages/TutorialsPage.jsx',
  'client/src/pages/ManagementContactsPage.jsx',
  'client/src/pages/LeadSalesSheet.jsx',
  'client/src/pages/LeadSalesUpdatePage.jsx',
  'client/src/pages/SalesCreatePage.jsx',
  'client/src/pages/AdminImportPage.jsx',
  'client/src/pages/TestNotificationsPage.jsx',
  'client/src/pages/TokenDebugPage.jsx'
];

// Additional professional enhancements
const professionalEnhancements = [
  // Add professional focus states
  {
    pattern: /(className="[^"]*?)focus:ring-blue-500/g,
    replacement: '$1focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
    description: 'Add professional focus states with proper offset'
  },
  
  // Enhance button styles
  {
    pattern: /(className="[^"]*?)bg-blue-600([^"]*?)"/g,
    replacement: '$1bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-200$2"',
    description: 'Enhance button styles with professional interactions'
  },
  
  // Professional table styling
  {
    pattern: /(className="[^"]*?)bg-white([^"]*?)rounded-lg([^"]*?)"/g,
    replacement: '$1bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700$2rounded-lg$3 shadow-sm dark:shadow-lg"',
    description: 'Add professional table container styling'
  }
];

// Function to upgrade a file to professional standards
function upgradeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return { upgraded: false, changes: 0 };
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    
    // Apply professional replacements
    professionalReplacements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        totalChanges += matches.length;
        console.log(`  ✨ ${description}: ${matches.length} changes`);
      }
    });
    
    // Apply professional enhancements
    professionalEnhancements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        totalChanges += matches.length;
        console.log(`  🎨 ${description}: ${matches.length} changes`);
      }
    });
    
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`🚀 Upgraded ${filePath} to professional standards - ${totalChanges} total changes`);
      return { upgraded: true, changes: totalChanges };
    } else {
      console.log(`✅ ${filePath} - Already professional or no changes needed`);
      return { upgraded: false, changes: 0 };
    }
    
  } catch (error) {
    console.error(`❌ Error upgrading ${filePath}:`, error.message);
    return { upgraded: false, changes: 0, error: error.message };
  }
}

// Function to add professional imports to files
function addProfessionalImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if professional imports already exist
    if (content.includes('professionalClasses') || content.includes('professionalDarkMode')) {
      return false;
    }
    
    // Find existing imports
    const importRegex = /import.*from.*['"][^'"]*['"];?\s*\n/g;
    const imports = content.match(importRegex) || [];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
      
      const professionalImport = `import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';\n`;
      
      content = content.slice(0, lastImportIndex) + professionalImport + content.slice(lastImportIndex);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📦 Added professional imports to ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`  ⚠️  Could not add imports to ${filePath}: ${error.message}`);
    return false;
  }
}

// Main execution function
function main() {
  console.log('🎨 Upgrading to Professional Dark Mode Standards...\n');
  console.log('Following industry standards from GitHub, Discord, Notion, and modern design systems\n');
  
  let totalFiles = 0;
  let upgradedFiles = 0;
  let totalChanges = 0;
  let importsAdded = 0;
  
  filesToUpgrade.forEach(file => {
    console.log(`\n📄 Upgrading: ${file}`);
    totalFiles++;
    
    // Add professional imports
    if (addProfessionalImports(file)) {
      importsAdded++;
    }
    
    // Upgrade the file
    const result = upgradeFile(file);
    if (result.upgraded) {
      upgradedFiles++;
      totalChanges += result.changes;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Professional Dark Mode Upgrade Complete!');
  console.log(`📊 Summary:`);
  console.log(`   • Total files processed: ${totalFiles}`);
  console.log(`   • Files upgraded: ${upgradedFiles}`);
  console.log(`   • Professional imports added: ${importsAdded}`);
  console.log(`   • Total improvements made: ${totalChanges}`);
  
  console.log('\n🎨 Professional Features Added:');
  console.log('   • Industry-standard color palette (Slate instead of Gray)');
  console.log('   • Professional shadows with proper dark mode variants');
  console.log('   • Sophisticated transitions and animations');
  console.log('   • Better contrast ratios for accessibility');
  console.log('   • Enhanced focus states and interactions');
  console.log('   • GitHub/Discord-inspired dark theme');
  
  console.log('\n💡 Next steps:');
  console.log('   1. Test the upgraded professional dark mode');
  console.log('   2. Verify improved contrast and readability');
  console.log('   3. Check all interactive states and animations');
  console.log('   4. Validate accessibility compliance');
  console.log('   5. Get feedback on the professional appearance');
}

// Run the upgrade
main();

export { upgradeFile, professionalReplacements, filesToUpgrade }; 