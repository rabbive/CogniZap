#!/usr/bin/env node

/**
 * Test script for CogniZap File Upload API
 * Tests PDF and PPT upload functionality
 * Run with: node test-upload.js
 */

import fs from 'fs';
import path from 'path';

async function createTestPDF() {
  // Simple PDF structure with text content
  const pdfHeader = '%PDF-1.4\n';
  const pdfContent = `1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF Content) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000181 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
275
%%EOF`;
  
  return Buffer.from(pdfHeader + pdfContent);
}

async function testUploadAPI() {
  console.log('🧪 Testing CogniZap Upload API...\n');

  try {
    // Test with a simple text file disguised as PDF for testing
    const testPDFBuffer = await createTestPDF();
    
    const formData = new FormData();
    const testFile = new File([testPDFBuffer], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', testFile);

    console.log('📄 Testing PDF upload...');
    console.log(`📝 File: test.pdf (${testFile.size} bytes)`);
    console.log('⏳ Sending request...\n');

    const response = await fetch('http://localhost:5173/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Upload API Test PASSED!');
      console.log(`📄 File: ${result.filename}`);
      console.log(`📏 Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
      console.log(`📝 Extracted: ${result.text?.length || 0} characters`);
      if (result.text) {
        console.log(`📖 Preview: ${result.text.substring(0, 100)}...`);
      }
    } else {
      console.log('\n❌ Upload API Test FAILED');
      console.log(`💬 Error: ${result.error}`);
    }

  } catch (error) {
    console.log('\n💥 Network Error:', error.message);
    console.log('🔧 Make sure your dev server is running: npm run dev');
  }
}

async function testEndToEnd() {
  console.log('\n🔄 Testing End-to-End Generation...\n');

  try {
    const testData = {
      topic: "Sample educational content about JavaScript fundamentals including variables, functions, and objects.",
      type: "flashcards",
      count: 3,
      difficulty: "easy"
    };

    console.log('📚 Testing content generation...');
    console.log('📝 Request:', JSON.stringify(testData, null, 2));
    console.log('⏳ Sending request...\n');

    const response = await fetch('http://localhost:5173/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📋 Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ End-to-End Test PASSED!');
      console.log(`🎯 Generated ${result.data.length} flashcards`);
    } else {
      console.log('\n❌ End-to-End Test FAILED');
      console.log(`💬 Error: ${result.error}`);
    }
  } catch (error) {
    console.log('\n💥 Network Error:', error.message);
  }
}

// Run tests
console.log('🚀 CogniZap API Test Suite\n');
console.log('📋 Test Plan:');
console.log('1. 📄 File Upload API');
console.log('2. 🔄 End-to-End Generation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Run upload test
await testUploadAPI();

// Wait a bit
await new Promise(resolve => setTimeout(resolve, 1000));

// Run generation test
await testEndToEnd();

console.log('\n🏁 Test Suite Complete!');
console.log('\n🔧 Setup Instructions:');
console.log('1. Add your Perplexity API key to .env: PERPLEXITY_API_KEY=pplx-your-key');
console.log('2. Restart dev server: npm run dev');
console.log('3. Open http://localhost:5173 to test the UI'); 