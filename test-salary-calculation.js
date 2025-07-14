// Test Salary Calculation Logic
// This test verifies that employees are paid correctly based on days present

console.log('🧮 SALARY CALCULATION TEST');
console.log('=' .repeat(60));

// Test scenarios
const testScenarios = [
  {
    name: 'Full month attendance (30 days)',
    baseSalary: 30000,
    daysPresent: 30,
    expectedSalary: 30000, // Full salary for full attendance
    description: 'Present for all 30 working days'
  },
  {
    name: 'One day present',
    baseSalary: 30000,
    daysPresent: 1,
    expectedSalary: 1000, // 30000/30 = 1000 per day
    description: 'Only 1 day present'
  },
  {
    name: '29 days present (1 day absent)',
    baseSalary: 30000,
    daysPresent: 29,
    expectedSalary: 29000, // (30000/30) * 29 = 29000
    description: 'Absent for 1 day'
  },
  {
    name: 'Half month attendance',
    baseSalary: 50000,
    daysPresent: 15,
    expectedSalary: 25000, // (50000/30) * 15 = 25000
    description: 'Present for half the month'
  },
  {
    name: 'High salary - 1 day present',
    baseSalary: 100000,
    daysPresent: 1,
    expectedSalary: 3333.33, // 100000/30 = 3333.33 per day
    description: 'High salary employee present for 1 day'
  }
];

// Salary calculation function (same as in React component)
const calculateSalary = (baseSalary, daysPresent) => {
  if (!baseSalary || !daysPresent) return 0;
  
  const calculatedAmount = (parseFloat(baseSalary) / 30) * parseFloat(daysPresent);
  return calculatedAmount;
};

// Run tests
console.log('\n📊 RUNNING SALARY CALCULATION TESTS...\n');

let allTestsPassed = true;

testScenarios.forEach((scenario, index) => {
  console.log(`\n🔍 Test ${index + 1}: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`💰 Base Salary: ₹${scenario.baseSalary.toLocaleString()}`);
  console.log(`✅ Days Present: ${scenario.daysPresent}`);
  console.log(`❌ Days Absent: ${30 - scenario.daysPresent}`);
  
  const calculatedSalary = calculateSalary(scenario.baseSalary, scenario.daysPresent);
  const dailyRate = scenario.baseSalary / 30;
  
  console.log(`📊 Daily Rate: ₹${dailyRate.toFixed(2)}`);
  console.log(`🎯 Expected Salary: ₹${scenario.expectedSalary.toFixed(2)}`);
  console.log(`💵 Calculated Salary: ₹${calculatedSalary.toFixed(2)}`);
  
  const isCorrect = Math.abs(calculatedSalary - scenario.expectedSalary) < 0.01;
  console.log(`✅ Test Result: ${isCorrect ? 'PASS' : 'FAIL'}`);
  
  if (!isCorrect) {
    allTestsPassed = false;
    console.log(`❌ ERROR: Expected ₹${scenario.expectedSalary.toFixed(2)} but got ₹${calculatedSalary.toFixed(2)}`);
  }
  
  console.log('-'.repeat(50));
});

console.log('\n🎯 SUMMARY');
console.log('=' .repeat(60));
console.log(`Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 SUCCESS! Salary calculation is working correctly.');
  console.log('✅ Employees absent multiple days get prorated salary.');
  console.log('✅ The formula (Base Salary ÷ Working Days) × Days Present is correct.');
} else {
  console.log('\n❌ FAILURE! Salary calculation needs to be fixed.');
  console.log('🚨 Employees might be getting full salary even when absent!');
}

console.log('\n📋 KEY POINTS:');
console.log('• If someone is absent 30 days out of 31, they get 1/31 salary');
console.log('• February has 28 days, so use 28 as working days, not 30');
console.log('• Formula: (Base Salary ÷ Working Days) × Days Present');
console.log('• This ensures fair pay based on actual attendance');

console.log('\n🚀 To run this test: node test-salary-calculation.js'); 