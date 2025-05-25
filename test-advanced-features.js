#!/usr/bin/env node

/**
 * Comprehensive Test Suite for CogniZap Advanced Features
 * Tests all enhanced APIs with real-time Sonar integration
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const BASE_URL = 'http://localhost:5173';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🚀 Starting CogniZap Advanced Features Test Suite\n');

// Test configurations for each API
const testConfigs = {
  researchAssistant: {
    endpoint: '/api/research-assistant',
    payload: {
      topic: 'Artificial Intelligence in Healthcare',
      perspectives: ['academic', 'industry', 'news'],
      timeframe: 'week',
      depth: 'detailed',
      includeDebate: true
    }
  },
  liveDataLearning: {
    endpoint: '/api/live-data-learning',
    payload: {
      dataType: 'stocks',
      symbols: ['AAPL', 'GOOGL', 'TSLA'],
      analysisType: 'trends',
      contentType: 'flashcards',
      count: 5,
      difficulty: 'medium'
    }
  },
  skillDemand: {
    endpoint: '/api/skill-demand',
    payload: {
      industry: 'Technology',
      role: 'Software Engineer',
      location: 'United States',
      timeframe: 'current',
      analysisType: 'skills',
      contentType: 'quiz',
      count: 5,
      difficulty: 'medium'
    }
  },
  globalEvents: {
    endpoint: '/api/global-events',
    payload: {
      eventType: 'political',
      region: 'Global',
      timeframe: 'week',
      significance: 'major',
      contentType: 'flashcards',
      count: 5,
      difficulty: 'medium',
      includeAnalysis: true
    }
  },
  scienceTracker: {
    endpoint: '/api/science-tracker',
    payload: {
      field: 'ai',
      timeframe: 'week',
      significance: 'breakthrough',
      contentType: 'quiz',
      count: 5,
      difficulty: 'hard',
      includeImplications: true
    }
  },
  learningCompetitions: {
    endpoint: '/api/learning-competitions',
    payload: {
      competitionType: 'trending-quiz',
      topic: 'Technology',
      difficulty: 'mixed',
      duration: 15,
      participantCount: 10,
      realTimeData: true
    }
  },
  viralAnalysis: {
    endpoint: '/api/viral-analysis',
    payload: {
      platform: 'all',
      contentType: 'educational',
      timeframe: 'week',
      viralityThreshold: 'viral',
      analysisDepth: 'detailed',
      generateContent: 'both',
      count: 5,
      difficulty: 'medium'
    }
  }
};

// Enhanced test function with detailed validation
async function testAPI(name, config) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`📍 Endpoint: ${config.endpoint}`);
  console.log(`📦 Payload:`, JSON.stringify(config.payload, null, 2));

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}${config.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.payload)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ ${name} failed:`, data.error);
      return false;
    }

    console.log(`✅ ${name} successful (${responseTime}ms)`);
    
    // Validate response structure
    if (data.success && data.data) {
      console.log(`📊 Response validation:`);
      
      // Common validations
      if (data.data.generatedContent) {
        console.log(`   - Generated content: ${data.data.generatedContent.length} items`);
      }
      if (data.data.sources) {
        console.log(`   - Sources: ${data.data.sources.length} items`);
      }
      if (data.data.lastUpdated) {
        console.log(`   - Last updated: ${new Date(data.data.lastUpdated).toLocaleString()}`);
      }

      // API-specific validations
      switch (name) {
        case 'researchAssistant':
          if (data.data.perspectives) {
            console.log(`   - Perspectives analyzed: ${data.data.perspectives.length}`);
          }
          if (data.data.synthesis) {
            console.log(`   - Synthesis provided: ✓`);
          }
          if (data.data.keyDebatePoints) {
            console.log(`   - Debate points: ${data.data.keyDebatePoints.length}`);
          }
          break;

        case 'liveDataLearning':
          if (data.data.dataSnapshot) {
            console.log(`   - Data snapshot: ✓`);
          }
          if (data.data.insights) {
            console.log(`   - Insights: ${data.data.insights.length}`);
          }
          if (data.updateInterval) {
            console.log(`   - Update interval: ${data.updateInterval}ms`);
          }
          break;

        case 'skillDemand':
          if (data.data.skillAnalysis) {
            console.log(`   - Top skills: ${data.data.skillAnalysis.topSkills?.length || 0}`);
            console.log(`   - Emerging skills: ${data.data.skillAnalysis.emergingSkills?.length || 0}`);
          }
          if (data.data.marketInsights) {
            console.log(`   - Market insights: ${data.data.marketInsights.length}`);
          }
          break;

        case 'globalEvents':
          if (data.data.trackedEvents) {
            console.log(`   - Tracked events: ${data.data.trackedEvents.length}`);
          }
          if (data.data.eventAnalysis) {
            console.log(`   - Event analysis: ✓`);
          }
          if (data.data.significanceScore) {
            console.log(`   - Significance score: ${data.data.significanceScore}`);
          }
          break;

        case 'scienceTracker':
          if (data.data.discoveries) {
            console.log(`   - Discoveries: ${data.data.discoveries.length}`);
          }
          if (data.data.researchTrends) {
            console.log(`   - Research trends: ${data.data.researchTrends.length}`);
          }
          if (data.data.innovationScore) {
            console.log(`   - Innovation score: ${data.data.innovationScore}`);
          }
          break;

        case 'learningCompetitions':
          if (data.data.questions) {
            console.log(`   - Competition questions: ${data.data.questions.length}`);
          }
          if (data.data.rewards) {
            console.log(`   - Rewards: ${data.data.rewards.length}`);
          }
          if (data.competitionCode) {
            console.log(`   - Competition code: ${data.competitionCode}`);
          }
          break;

        case 'viralAnalysis':
          if (data.data.viralContent) {
            console.log(`   - Viral content analyzed: ${data.data.viralContent.length}`);
          }
          if (data.data.trendAnalysis) {
            console.log(`   - Trend analysis: ✓`);
          }
          if (data.data.viralScore) {
            console.log(`   - Viral score: ${data.data.viralScore}`);
          }
          break;
      }

      // Sample content preview
      if (data.data.generatedContent && data.data.generatedContent.length > 0) {
        const sample = data.data.generatedContent[0];
        console.log(`📝 Sample content preview:`);
        if (sample.question) {
          console.log(`   Q: ${sample.question.substring(0, 100)}...`);
        }
        if (sample.answer) {
          console.log(`   A: ${sample.answer.substring(0, 100)}...`);
        }
        if (sample.options) {
          console.log(`   Options: ${sample.options.length} choices`);
        }
      }

      return true;
    } else {
      console.log(`❌ ${name} returned invalid response structure`);
      return false;
    }

  } catch (error) {
    console.log(`❌ ${name} error:`, error.message);
    return false;
  }
}

// Performance and integration tests
async function runPerformanceTests() {
  console.log('\n🏃‍♂️ Running Performance Tests...');
  
  const performanceTests = [
    {
      name: 'Concurrent API Calls',
      test: async () => {
        const promises = [
          testAPI('researchAssistant', testConfigs.researchAssistant),
          testAPI('liveDataLearning', testConfigs.liveDataLearning),
          testAPI('skillDemand', testConfigs.skillDemand)
        ];
        
        const startTime = Date.now();
        const results = await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        console.log(`⏱️  Concurrent execution time: ${totalTime}ms`);
        console.log(`✅ Successful calls: ${results.filter(r => r).length}/${results.length}`);
        
        return results.every(r => r);
      }
    },
    {
      name: 'Large Content Generation',
      test: async () => {
        const largeConfig = {
          ...testConfigs.researchAssistant,
          payload: {
            ...testConfigs.researchAssistant.payload,
            depth: 'comprehensive',
            includeDebate: true
          }
        };
        
        return await testAPI('researchAssistant-large', largeConfig);
      }
    }
  ];

  for (const test of performanceTests) {
    console.log(`\n🔬 ${test.name}:`);
    const result = await test.test();
    console.log(result ? '✅ Passed' : '❌ Failed');
  }
}

// Integration tests
async function runIntegrationTests() {
  console.log('\n🔗 Running Integration Tests...');
  
  // Test trending topics integration
  console.log('\n📈 Testing Trending Topics Integration:');
  try {
    const trendingResponse = await fetch(`${BASE_URL}/api/trending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 5, category: 'technology' })
    });
    
    const trendingData = await trendingResponse.json();
    
    if (trendingData.success && trendingData.data.topics.length > 0) {
      console.log('✅ Trending topics API working');
      
      // Use trending topic for content generation
      const trendingTopic = trendingData.data.topics[0].title;
      console.log(`🎯 Using trending topic: "${trendingTopic}"`);
      
      const generateResponse = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: trendingTopic,
          type: 'flashcards',
          count: 3,
          difficulty: 'medium',
          includeCurrentEvents: true,
          enableFactChecking: true
        })
      });
      
      const generateData = await generateResponse.json();
      
      if (generateData.success) {
        console.log('✅ Trending topic integration successful');
        console.log(`📚 Generated ${generateData.data.flashcards.length} flashcards`);
      } else {
        console.log('❌ Content generation from trending topic failed');
      }
    } else {
      console.log('❌ Trending topics API failed');
    }
  } catch (error) {
    console.log('❌ Integration test error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = Object.keys(testConfigs).length;

  console.log(`🎯 Running ${totalTests} API tests...\n`);

  // Test each API
  for (const [name, config] of Object.entries(testConfigs)) {
    const result = await testAPI(name, config);
    if (result) passedTests++;
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Run performance tests
  await runPerformanceTests();
  
  // Run integration tests
  await runIntegrationTests();

  const totalTime = Date.now() - startTime;

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}/${totalTests} API tests`);
  console.log(`⏱️  Total execution time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`🚀 Average response time: ${(totalTime / totalTests / 1000).toFixed(2)}s`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! CogniZap advanced features are working correctly.');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} tests failed. Check the logs above for details.`);
  }

  console.log('\n🔧 Advanced Features Tested:');
  console.log('   • Smart Research Assistant with multi-perspective analysis');
  console.log('   • Live Market & Data Learning with real-time integration');
  console.log('   • Skill Demand Intelligence with job market insights');
  console.log('   • Global Event Learning with geopolitical analysis');
  console.log('   • Scientific Breakthrough Tracker with research monitoring');
  console.log('   • Real-Time Learning Competitions with gamification');
  console.log('   • Viral Content Analysis with social media insights');
  console.log('\n💡 All features leverage Perplexity Sonar API for real-time data!');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}); 