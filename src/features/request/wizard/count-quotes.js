import fs from 'fs';

const content = fs.readFileSync('NewRequestWizard.tsx', 'utf8');
const lines = content.split('\n');

console.log('Analyzing quotes in NewRequestWizard.tsx:');
console.log('==========================================');

let singleQuoteCount = 0;
let doubleQuoteCount = 0;

lines.forEach((line, index) => {
  const singleQuotes = (line.match(/'/g) || []).length;
  const doubleQuotes = (line.match(/"/g) || []).length;
  
  if (singleQuotes > 0 || doubleQuotes > 0) {
    console.log(`Line ${index + 1}: '${singleQuotes}' "${doubleQuotes}" | ${line.trim()}`);
  }
  
  singleQuoteCount += singleQuotes;
  doubleQuoteCount += doubleQuotes;
});

console.log('\nTotal counts:');
console.log(`Single quotes: ${singleQuoteCount} (${singleQuoteCount % 2 === 0 ? 'even' : 'odd'})`);
console.log(`Double quotes: ${doubleQuoteCount} (${doubleQuoteCount % 2 === 0 ? 'even' : 'odd'})`);

// Check template literals
const templateLiterals = content.match(/`[^`]*`/g) || [];
console.log(`\nTemplate literals found: ${templateLiterals.length}`);
templateLiterals.forEach((template, index) => {
  console.log(`  ${index + 1}: ${template}`);
});
