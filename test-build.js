// Test script to verify the library build
const path = require('path');

// Test ES module import
async function testESImport() {
  try {
    const { MultilineEditor, Home, Login } = await import('./dist/index.es.js');
    console.log('✅ ES module import successful');
    console.log('Components found:', { MultilineEditor, Home, Login });
  } catch (error) {
    console.error('❌ ES module import failed:', error.message);
  }
}

// Test CommonJS import
function testCJSImport() {
  try {
    const { MultilineEditor, Home, Login } = require('./dist/index.js');
    console.log('✅ CommonJS import successful');
    console.log('Components found:', { MultilineEditor, Home, Login });
  } catch (error) {
    console.error('❌ CommonJS import failed:', error.message);
  }
}

console.log('Testing library build...\n');

testCJSImport();
testESImport();
