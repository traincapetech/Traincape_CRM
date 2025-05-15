import fs from 'fs';
import path from 'path';
import axios from 'axios';
import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Constants
const CSV_FILE_PATH = process.argv[2] || './leads.csv';
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
  console.log('Usage: node importLeads.js [path/to/leads.csv]');
  process.exit(1);
}

// Validate token exists
if (!API_TOKEN) {
  console.error('❌ Error: API_TOKEN environment variable is required');
  console.log('Please set API_TOKEN in your .env file or environment');
  process.exit(1);
}

// Function to import leads
async function importLeads() {
  console.log(`🔄 Reading leads from ${CSV_FILE_PATH}...`);
  
  const leads = [];
  
  // Parse CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csvParser())
      .on('data', (row) => {
        leads.push(row);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
  
  console.log(`📊 Found ${leads.length} leads in CSV file`);
  
  // Show sample data
  if (leads.length > 0) {
    console.log('\n📋 Sample data from first row:');
    console.log(JSON.stringify(leads[0], null, 2));
  }
  
  // Ask for confirmation
  await new Promise((resolve) => {
    rl.question('\n⚠️ Do you want to import these leads? (yes/no): ', (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Import cancelled');
        process.exit(0);
      }
      resolve();
    });
  });
  
  // Import leads
  try {
    console.log(`🔄 Importing ${leads.length} leads to ${API_URL}/leads/import...`);
    
    const response = await axios.post(`${API_URL}/leads/import`, 
      { leads },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      }
    );
    
    console.log('✅ Import successful!');
    console.log(`📊 Imported ${response.data.count} leads`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error importing leads:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Run the import
importLeads()
  .then(() => {
    rl.close();
    process.exit(0);
  })
  .catch((error) => {
    rl.close();
    process.exit(1);
  }); 