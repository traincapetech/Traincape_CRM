const mongoose = require('mongoose');
const Sale = require('./server/models/Sale');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Count all sales
    const totalSales = await Sale.countDocuments();
    console.log('Total sales in database:', totalSales);
    
    // Get first few sales
    const sales = await Sale.find().limit(5);
    console.log('First 5 sales:', JSON.stringify(sales, null, 2));
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('Database check error:', error);
    process.exit(1);
  }
}

checkDatabase(); 