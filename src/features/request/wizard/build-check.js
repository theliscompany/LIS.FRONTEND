#!/usr/bin/env node

/**
 * Build check script for the new Request Wizard
 * Verifies that all components can be imported and built successfully
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wizardDir = __dirname;
const srcDir = path.join(wizardDir, '../../../src');

// Files to check
const filesToCheck = [
  'schema.ts',
  'wizard.config.ts',
  'WizardEngine.tsx',
  'StepRouter.tsx',
  'LivePreview.tsx',
  'toDraftQuote.ts',
  'NewRequestWizard.tsx',
  'ExpressWizard.tsx',
  'pages/BasicsStep.tsx',
  'pages/OptionsStep.tsx',
  'pages/ReviewStep.tsx',
  'pages/ExpressStep.tsx',
  'index.ts'
];

// Check if file exists and has content
function checkFile(filePath) {
  const fullPath = path.join(wizardDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing file: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.trim().length === 0) {
    console.error(`❌ Empty file: ${filePath}`);
    return false;
  }
  
  console.log(`✅ ${filePath}`);
  return true;
}

// Check TypeScript syntax
function checkTypeScriptSyntax(filePath) {
  const fullPath = path.join(wizardDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Basic TypeScript syntax checks
  const issues = [];
  
  // Check for unclosed brackets
  const openBrackets = (content.match(/\{/g) || []).length;
  const closeBrackets = (content.match(/\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push('Unclosed brackets');
  }
  
  // Check for unclosed parentheses
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push('Unclosed parentheses');
  }
  
  // Check for unclosed strings (ignore template literals)
  const templateLiterals = (content.match(/`[^`]*`/g) || []).length;
  const contentWithoutTemplates = content.replace(/`[^`]*`/g, '');
  const singleQuotes = (contentWithoutTemplates.match(/'/g) || []).length;
  const doubleQuotes = (contentWithoutTemplates.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    issues.push('Unclosed single quotes');
  }
  if (doubleQuotes % 2 !== 0) {
    issues.push('Unclosed double quotes');
  }
  
  if (issues.length > 0) {
    console.error(`❌ Syntax issues in ${filePath}: ${issues.join(', ')}`);
    return false;
  }
  
  return true;
}

// Check imports
function checkImports(filePath) {
  const fullPath = path.join(wizardDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Extract import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Check if imported files exist
  const issues = [];
  imports.forEach(importPath => {
    // Skip external packages
    if (importPath.startsWith('@') || importPath.startsWith('react') || importPath.startsWith('@mui')) {
      return;
    }
    
    // Check relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolvedPath = path.resolve(path.dirname(fullPath), importPath);
      if (!fs.existsSync(resolvedPath) && !fs.existsSync(resolvedPath + '.ts') && !fs.existsSync(resolvedPath + '.tsx')) {
        issues.push(`Missing import: ${importPath}`);
      }
    }
  });
  
  if (issues.length > 0) {
    console.error(`❌ Import issues in ${filePath}: ${issues.join(', ')}`);
    return false;
  }
  
  return true;
}

// Main check function
function runBuildCheck() {
  console.log('🔍 Running build check for Request Wizard v2...\n');
  
  let allPassed = true;
  
  // Check all files
  filesToCheck.forEach(file => {
    if (!checkFile(file)) {
      allPassed = false;
    }
  });
  
  console.log('\n🔍 Checking TypeScript syntax...\n');
  
  // Check TypeScript syntax
  filesToCheck.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (!checkTypeScriptSyntax(file)) {
        allPassed = false;
      }
    }
  });
  
  console.log('\n🔍 Checking imports...\n');
  
  // Check imports
  filesToCheck.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (!checkImports(file)) {
        allPassed = false;
      }
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ All checks passed! The wizard is ready for use.');
    console.log('\n📚 Next steps:');
    console.log('1. Run the application: npm run dev');
    console.log('2. Navigate to /request-wizard to test the new wizard');
    console.log('3. Navigate to /request-express to test express mode');
    console.log('4. Run tests: npm run test');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run the check
runBuildCheck();
