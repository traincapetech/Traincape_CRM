import fs from 'fs';
import path from 'path';
import axios from 'axios';
import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Constants
const CSV_FILE_PATH = process.argv[2] || './sales.csv';
const API_URL = process.env.API_URL || 'http://localhost:5050/api';
const API_TOKEN = process.env.API_TOKEN;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Validate CSV file exists
if (!fs.existsSync(CSV_FILE_PATH)) {
  console.error(`❌ Error: CSV file not found at ${CSV_FILE_PATH}`);
  console.log('Usage: node importSales.js [path/to/sales.csv]');
  process.exit(1);
}

// Validate token exists
if (!API_TOKEN) {
  console.error('❌ Error: API_TOKEN environment variable is required');
  console.log('Please set API_TOKEN in your .env file or environment');
  process.exit(1);
}

// Function to import sales
async function importSales() {
  console.log(`🔄 Reading sales from ${CSV_FILE_PATH}...`);
  
  const sales = [];
  
  // Parse CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csvParser())
      .on('data', (row) => {
        sales.push(row);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
  
  console.log(`📊 Found ${sales.length} sales in CSV file`);
  
  // Show sample data
  if (sales.length > 0) {
    console.log('\n📋 Sample data from first row:');
    console.log(JSON.stringify(sales[0], null, 2));
  }
  
  // Ask for confirmation
  await new Promise((resolve) => {
    rl.question('\n⚠️ Do you want to import these sales? (yes/no): ', (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Import cancelled');
        process.exit(0);
      }
      resolve();
    });
  });
  
  // Import sales
  try {
    console.log(`🔄 Importing ${sales.length} sales to ${API_URL}/sales/import...`);
    
    const response = await axios.post(`${API_URL}/sales/import`, 
      { sales },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );
    
    console.log('✅ Import successful!');
    console.log(`📊 Imported ${response.data.count} sales`);
    console.log(`⚠️ Failed to import ${response.data.errorCount} sales`);
    
    if (response.data.errorCount > 0) {
      console.log('\n❌ Import errors:');
      response.data.errors.forEach((error, index) => {
        console.log(`Error ${index+1}: ${error.message}`);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error importing sales:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Run the import
importSales()
  .then(() => {
    rl.close();
    process.exit(0);
  })
  .catch((error) => {
    rl.close();
    process.exit(1);
  }); 