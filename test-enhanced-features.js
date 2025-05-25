#!/usr/bin/env node

/**
 * Enhanced Features Test Script for CogniZap
 * Tests all new Sonar API features including trending topics, fact-checking, and news-based learning
 * Run with: node test-enhanced-features.js
 */

async function testTrendingTopics() {
  console.log('🔥 Testing Trending Topics API...\n');

  try {
    const categories = ['technology', 'science', 'business'];
    
    for (const category of categories) {
      console.log(`📊 Testing category: ${category}`);
      
      const response = await fetch(`http://localhost:5173/api/trending?category=${category}&limit=5`);
      const result = await response.json();
      
      console.log(`📋 Status: ${response.status}`);
      
      if (result.success) {
        console.log(`✅ Found ${result.data.length} trending topics in ${category}`);
        result.data.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic.topic} (Score: ${topic.score})`);
          console.log(`     Keywords: ${topic.relatedKeywords.join(', ')}`);
          console.log(`     Sources: ${topic.sources.length}`);
        });
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
      console.log('');
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

async function testEnhancedGeneration() {
  console.log('⚡ Testing Enhanced Generation API...\n');

  try {
    const testCases = [
      {
        name: 'Basic Enhanced Flashcards',
        request: {
          topic: 'Artificial Intelligence and Machine Learning trends in 2024',
          type: 'flashcards',
          count: 3,
          difficulty: 'medium',
          includeCurrentEvents: true,
          factCheck: true,
          includeSources: true,
          targetAudience: 'professional',
          contentFreshness: 'latest'
        }
      },
      {
        name: 'Current Events Quiz',
        request: {
          topic: 'Recent developments in renewable energy technology',
          type: 'quiz',
          count: 3,
          difficulty: 'medium',
          includeCurrentEvents: true,
          factCheck: true,
          includeSources: true,
          targetAudience: 'student',
          contentFreshness: 'recent'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`🧪 Testing: ${testCase.name}`);
      console.log(`📝 Request:`, JSON.stringify(testCase.request, null, 2));
      
      const response = await fetch('http://localhost:5173/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.request)
      });

      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      
      if (result.success) {
        console.log(`✅ ${testCase.name} PASSED!`);
        
        if (testCase.request.type === 'flashcards') {
          console.log(`📚 Generated ${result.data.length} flashcards`);
          console.log(`📖 Sample: ${result.data[0]?.question}`);
        } else {
          console.log(`🧠 Generated quiz: ${result.data.title}`);
          console.log(`❓ Questions: ${result.data.questions.length}`);
        }
        
        if (result.sources) {
          console.log(`📄 Sources: ${result.sources.length}`);
        }
        
        if (result.factCheckResults) {
          console.log(`✅ Fact checks: ${result.factCheckResults.length}`);
        }
        
        if (result.trendingnessScore) {
          console.log(`📈 Trending score: ${result.trendingnessScore}`);
        }
      } else {
        console.log(`❌ ${testCase.name} FAILED`);
        console.log(`💬 Error: ${result.error}`);
      }
      console.log('');
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

async function testNewsBasedLearning() {
  console.log('📰 Testing News-Based Learning API...\n');

  try {
    const testCases = [
      { category: 'technology', type: 'flashcards', timeframe: 'today' },
      { category: 'science', type: 'quiz', timeframe: 'this_week' }
    ];

    for (const testCase of testCases) {
      console.log(`📺 Testing news learning: ${testCase.category} ${testCase.type}`);
      
      const response = await fetch(
        `http://localhost:5173/api/news-learning?category=${testCase.category}&type=${testCase.type}&count=3&timeframe=${testCase.timeframe}`
      );
      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      
      if (result.success) {
        console.log(`✅ News learning test PASSED!`);
        console.log(`📰 Found ${result.data.length} news items`);
        
        result.data.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.headline}`);
          console.log(`     Category: ${item.category}`);
          console.log(`     Sources: ${item.sources.length}`);
          
          if (testCase.type === 'flashcards') {
            console.log(`     Flashcards: ${item.generatedContent.length}`);
          } else {
            console.log(`     Quiz: ${item.generatedContent.title}`);
          }
        });
      } else {
        console.log(`❌ News learning test FAILED`);
        console.log(`💬 Error: ${result.error}`);
      }
      console.log('');
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

async function testFactChecking() {
  console.log('✅ Testing Fact-Checking Features...\n');

  try {
    const testRequest = {
      topic: 'Climate change statistics and recent environmental policies',
      type: 'flashcards',
      count: 3,
      difficulty: 'medium',
      factCheck: true,
      includeSources: true,
      contentFreshness: 'recent'
    };

    console.log('🔍 Testing fact-checking with environmental topic...');
    
    const response = await fetch('http://localhost:5173/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });

    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    
    if (result.success) {
      console.log('✅ Fact-checking test PASSED!');
      
      // Check for fact-check specific features
      const hasFactChecks = result.factCheckResults && result.factCheckResults.length > 0;
      const hasSources = result.sources && result.sources.length > 0;
      const hasConfidenceScores = result.data.some(item => item.confidenceScore !== undefined);
      
      console.log(`🔍 Fact-check results: ${hasFactChecks ? '✅' : '❌'}`);
      console.log(`📚 Source citations: ${hasSources ? '✅' : '❌'}`);
      console.log(`📊 Confidence scores: ${hasConfidenceScores ? '✅' : '❌'}`);
      
      if (hasFactChecks) {
        console.log(`📋 Fact-check details:`);
        result.factCheckResults.forEach((check, index) => {
          console.log(`  ${index + 1}. ${check.claim}`);
          console.log(`     Status: ${check.status} (${check.confidence}% confidence)`);
        });
      }
    } else {
      console.log('❌ Fact-checking test FAILED');
      console.log(`💬 Error: ${result.error}`);
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

async function testRealTimeFeatures() {
  console.log('⏰ Testing Real-Time Features...\n');

  try {
    // Test multiple requests to see if content updates
    console.log('🔄 Testing content freshness...');
    
    const baseRequest = {
      topic: 'Latest developments in artificial intelligence',
      type: 'flashcards',
      count: 2,
      includeCurrentEvents: true,
      contentFreshness: 'latest'
    };

    const responses = [];
    
    for (let i = 0; i < 2; i++) {
      console.log(`📡 Request ${i + 1}/2...`);
      
      const response = await fetch('http://localhost:5173/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baseRequest)
      });

      const result = await response.json();
      responses.push(result);
      
      if (i === 0) {
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Compare responses
    const allSuccessful = responses.every(r => r.success);
    console.log(`📊 All requests successful: ${allSuccessful ? '✅' : '❌'}`);
    
    if (allSuccessful) {
      const hasTrendingScores = responses.every(r => r.trendingnessScore !== undefined);
      const hasTimestamps = responses.every(r => r.lastUpdated !== undefined);
      
      console.log(`📈 Trending scores: ${hasTrendingScores ? '✅' : '❌'}`);
      console.log(`⏰ Timestamps: ${hasTimestamps ? '✅' : '❌'}`);
      
      console.log('✅ Real-time features test PASSED!');
    } else {
      console.log('❌ Real-time features test FAILED');
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 CogniZap Enhanced Features Test Suite\n');
  console.log('📋 Test Plan:');
  console.log('1. 🔥 Trending Topics API');
  console.log('2. ⚡ Enhanced Generation API');
  console.log('3. 📰 News-Based Learning API');
  console.log('4. ✅ Fact-Checking Features');
  console.log('5. ⏰ Real-Time Features');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await testTrendingTopics();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testEnhancedGeneration();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testNewsBasedLearning();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testFactChecking();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testRealTimeFeatures();

  console.log('\n🏁 Enhanced Features Test Suite Complete!');
  console.log('\n🔧 Setup Instructions:');
  console.log('1. Ensure your Perplexity API key is set: PERPLEXITY_API_KEY=pplx-your-key');
  console.log('2. Restart dev server: npm run dev');
  console.log('3. Open http://localhost:5173 to test the enhanced UI');
  console.log('4. Try the trending topics sidebar and advanced options');
}

runAllTests().catch(console.error); 