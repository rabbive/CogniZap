#!/usr/bin/env node

/**
 * Test script for CogniZap Perplexity API integration
 * Run with: node test-api.js
 */

async function testAPI() {
  const testData = {
    topic: "JavaScript async/await",
    type: "flashcards",
    count: 3,
    difficulty: "easy"
  };

  console.log('🧪 Testing CogniZap API...');
  console.log('📝 Request:', JSON.stringify(testData, null, 2));
  console.log('⏳ Sending request...\n');

  try {
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
      console.log('\n✅ API Test PASSED!');
      console.log(`🎯 Generated ${result.data.length} flashcards`);
      console.log('📚 Sample flashcard:');
      console.log(`   Q: ${result.data[0].question}`);
      console.log(`   A: ${result.data[0].answer}`);
    } else {
      console.log('\n❌ API Test FAILED');
      console.log(`💬 Error: ${result.error}`);
      
      if (result.error.includes('API key')) {
        console.log('\n🔧 Setup Instructions:');
        console.log('1. Get your API key from: https://docs.perplexity.ai/docs/getting-started');
        console.log('2. Add it to your .env file: PERPLEXITY_API_KEY=pplx-your-key-here');
        console.log('3. Restart the dev server: npm run dev');
      }
    }
  } catch (error) {
    console.log('\n💥 Network Error:', error.message);
    console.log('🔧 Make sure your dev server is running: npm run dev');
  }
}

testAPI(); 