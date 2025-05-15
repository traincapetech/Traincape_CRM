# CRM Data Import Scripts

These scripts allow you to easily import your Google Sheets data into your CRM backend.

## Prerequisites

- Node.js 14 or higher
- Access to your CRM backend API
- Admin account on your CRM system

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   # API Configuration
   # Use the URL of your backend server
   API_URL=http://localhost:5050/api

   # The JWT token for authenticated requests
   # To get this token, login to your CRM app and copy the token from localStorage
   # Or make a POST request to /api/auth/login with your admin credentials
   API_TOKEN=your_jwt_token_here
   ```

3. Export your Google Sheets as CSV:
   - Open your Google Sheet
   - Go to File > Download > Comma-separated values (.csv)
   - Save the file to the same directory as these scripts

## Importing Leads

1. Export your Leads Google Sheet to a CSV file named `leads.csv`
2. Run the import script:
   ```
   npm run import-leads
   ```
   Or with a custom file path:
   ```
   npm run import-leads -- path/to/your/leads.csv
   ```

## Importing Sales

1. Export your Sales Google Sheet to a CSV file named `sales.csv`
2. Run the import script:
   ```
   npm run import-sales
   ```
   Or with a custom file path:
   ```
   npm run import-sales -- path/to/your/sales.csv
   ```

## CSV Field Mapping

### Leads CSV Format
The script will look for the following columns in your leads CSV (case-insensitive):

- Name, name (required)
- Email, email (required)
- Course, course (required) 
- CountryCode, Country Code, countryCode
- Phone, phone (required)
- Country, country (required)
- PseudoId, pseudoId, ID, id
- Company, company
- Client, client
- Status, status
- Source, source
- SourceLink, Source Link, sourceLink
- Remarks, remarks
- Feedback, feedback

### Sales CSV Format
For sales, we need to identify which lead the sale belongs to. The script will look for:

- Email, email (used to match with lead) - either email or phone is required
- Phone, phone (used to match with lead) - either email or phone is required
- Amount, amount (required)
- Token, token
- Product, product (required)
- Status, status
- Notes, notes

## Error Handling

If any leads or sales fail to import, the script will log the errors and continue with the rest. You'll get a detailed report at the end showing what was imported and what failed. 