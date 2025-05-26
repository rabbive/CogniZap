import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { 
  GenerateRequest, 
  GenerateResponse, 
  Flashcard, 
  Quiz, 
  PerplexityRequest,
  EnhancedGenerateRequest,
  EnhancedGenerateResponse,
  Source,
  FactCheckResult
} from '$lib/types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const generateRequest: EnhancedGenerateRequest = await request.json();
    const { 
      topic, 
      type, 
      count = 10, 
      difficulty = 'mixed',
      preferences,
      includeCurrentEvents = false,
      factCheck = false,
      includeSources = false,
      targetAudience = 'student',
      contentFreshness = 'recent'
    } = generateRequest;

    if (!topic || !type) {
      return json({
        success: false,
        error: 'Topic and type are required'
      } as GenerateResponse, { status: 400 });
    }

    const PERPLEXITY_API_KEY = env.PERPLEXITY_API_KEY;
    
    // If no API key is configured, return demo content
    if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === 'your_actual_api_key_here') {
      console.log('⚠️ No Perplexity API key configured, returning demo content');
      return generateDemoContent(topic, type, count, difficulty, {
        includeCurrentEvents,
        factCheck,
        includeSources,
        targetAudience,
        contentFreshness
      });
    }

    console.log('✅ Using Enhanced Perplexity API with key starting with:', PERPLEXITY_API_KEY.substring(0, 8) + '...');

    // Enhanced prompt creation with new features
    const prompt = type === 'flashcards' 
      ? createEnhancedFlashcardPrompt(topic, count, difficulty, {
          includeCurrentEvents,
          factCheck,
          includeSources,
          targetAudience,
          contentFreshness
        })
      : createEnhancedQuizPrompt(topic, count, difficulty, {
          includeCurrentEvents,
          factCheck,
          includeSources,
          targetAudience,
          contentFreshness
        });

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `You are an expert educational content creator with access to real-time information. Generate high-quality, accurate educational content in valid JSON format only. ${includeSources ? 'Include reliable sources with citations.' : ''} ${factCheck ? 'Verify all facts and include confidence scores.' : ''} ${includeCurrentEvents ? 'Include current events and trending information when relevant.' : ''} Do not include any text outside the JSON response.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 6000
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(perplexityRequest)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Perplexity API error: ${response.status} ${response.statusText}`, errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        return json({
          success: false,
          error: 'Invalid API key. Please check your Perplexity API key configuration.'
        } as GenerateResponse, { status: 401 });
      } else if (response.status === 429) {
        return json({
          success: false,
          error: 'Rate limit exceeded. Please try again in a few moments.'
        } as GenerateResponse, { status: 429 });
      } else if (response.status >= 500) {
        return json({
          success: false,
          error: 'Perplexity API service temporarily unavailable. Please try again later.'
        } as GenerateResponse, { status: 503 });
      }
      
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const perplexityResponse = await response.json();
    const content = perplexityResponse.choices[0]?.message?.content;

    if (!content) {
      console.error('Empty response from Perplexity API:', perplexityResponse);
      throw new Error('No content received from Perplexity API');
    }

    // Parse the JSON response - handle potential markdown formatting and JSON cleanup
    let cleanedContent = content.trim();
    // Remove all code block markers (robust)
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/g, '').trim();
    
    // Clean up common JSON formatting issues from AI responses
    cleanedContent = cleanedContent
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas before } or ]
      .replace(/([}\]]),\s*([}\]])/g, '$1$2') // Remove commas between closing brackets
      .replace(/,\s*}/g, '}') // Remove trailing commas before }
      .replace(/,\s*]/g, ']'); // Remove trailing commas before ]
    
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ JSON parse error. Raw content length:', content.length);
      console.error('Raw content preview:', content.substring(0, 500) + '...');
      console.error('Cleaned content preview:', cleanedContent.substring(0, 500) + '...');
      
            // Try one more aggressive cleanup
      try {
        console.log('🔧 Attempting aggressive JSON cleanup...');
        
        // More aggressive cleanup for malformed JSON
        let moreCleanedContent = cleanedContent
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([}\]]),(\s*[}\]])/g, '$1$2') // Remove commas between closing brackets
          .replace(/,\s*}/g, '}') // Remove trailing commas before }
          .replace(/,\s*]/g, ']') // Remove trailing commas before ]
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        // Additional cleanup for common AI response issues
        moreCleanedContent = moreCleanedContent
          .replace(/,(\s*[}\]])/g, '$1') // Double check trailing commas
          .replace(/\},\s*\]/g, '}]') // Fix object arrays
          .replace(/"\s*,\s*,/g, '",') // Fix double commas
          .replace(/,\s*,/g, ','); // Fix double commas
        
        generatedContent = JSON.parse(moreCleanedContent);
        console.log('✅ Successfully parsed JSON after aggressive cleanup');
      } catch (secondParseError) {
        console.error('❌ Second JSON parse attempt failed:', secondParseError);
        console.error('Final cleaned content preview available in logs');
        
        throw new Error(`Failed to parse API response as JSON: ${parseError}`);
      }
    }

    // Extract sources and fact-check results if included
    const sources: Source[] = generatedContent.sources?.map((source: any) => ({
      url: source.url,
      title: source.title,
      publishedDate: new Date(source.publishedDate),
      reliability: source.reliability || 80,
      domain: new URL(source.url).hostname,
      snippet: source.snippet
    })) || [];

    const factCheckResults: FactCheckResult[] = generatedContent.factCheckResults?.map((result: any) => ({
      claim: result.claim,
      status: result.status,
      confidence: result.confidence,
      sources: result.sources || [],
      explanation: result.explanation
    })) || [];

    const trendingnessScore = generatedContent.trendingnessScore || 0;
    const relatedTopics = generatedContent.relatedTopics || [];

    if (type === 'flashcards') {
      const flashcards: Flashcard[] = generatedContent.flashcards.map((item: any, index: number) => ({
        id: `flashcard-${Date.now()}-${index}`,
        question: item.question,
        answer: item.answer,
        difficulty: item.difficulty || difficulty,
        topic,
        createdAt: new Date(),
        // Enhanced features
        sources: item.sources?.map((source: any) => ({
          url: source.url,
          title: source.title,
          publishedDate: new Date(source.publishedDate),
          reliability: source.reliability || 80,
          domain: new URL(source.url).hostname,
          snippet: source.snippet
        })) || [],
        lastUpdated: new Date(),
        trendingnessScore: item.trendingnessScore || trendingnessScore,
        relatedCurrentTopics: item.relatedTopics || relatedTopics,
        factCheckStatus: item.factCheckStatus || 'verified',
        confidenceScore: item.confidenceScore || 85
      }));

      return json({
        success: true,
        data: flashcards,
        sources,
        trendingnessScore,
        factCheckResults,
        relatedTopics,
        lastUpdated: new Date(),
        contentFreshness
      } as EnhancedGenerateResponse);
    } else {
      const quiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: generatedContent.title,
        description: generatedContent.description,
        questions: generatedContent.questions.map((q: any, index: number) => ({
          id: `question-${Date.now()}-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          // Enhanced features
          sources: q.sources?.map((source: any) => ({
            url: source.url,
            title: source.title,
            publishedDate: new Date(source.publishedDate),
            reliability: source.reliability || 80,
            domain: new URL(source.url).hostname,
            snippet: source.snippet
          })) || [],
          factCheckStatus: q.factCheckStatus || 'verified',
          confidenceScore: q.confidenceScore || 85,
          relatedTopics: q.relatedTopics || []
        })),
        topic,
        timeLimit: 30, // 30 minutes default
        createdAt: new Date(),
        // Enhanced features
        sources,
        lastUpdated: new Date(),
        trendingnessScore,
        isCurrentEvents: includeCurrentEvents,
        expertiseLevel: targetAudience === 'researcher' ? 'expert' : 
                       targetAudience === 'professional' ? 'intermediate' : 'beginner'
      };

      return json({
        success: true,
        data: quiz,
        sources,
        trendingnessScore,
        factCheckResults,
        relatedTopics,
        lastUpdated: new Date(),
        contentFreshness
      } as EnhancedGenerateResponse);
    }

  } catch (error) {
    console.error('Enhanced Generate API error:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to generate content. Please try again.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key configuration issue. Please check your environment variables.';
        statusCode = 401;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
        statusCode = 503;
      } else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'Content parsing error. The AI service may be experiencing issues.';
        statusCode = 502;
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        statusCode = 429;
      } else if (error.message.includes('Perplexity API')) {
        // Use the specific error message from API
        errorMessage = error.message;
      }
    }
    
    return json({
      success: false,
      error: errorMessage
    } as GenerateResponse, { status: statusCode });
  }
};

function createFlashcardPrompt(topic: string, count: number, difficulty: string): string {
  return `Create ${count} educational flashcards about "${topic}" with ${difficulty} difficulty level.

Return a JSON array where each flashcard has this exact structure:
{
  "question": "Clear, concise question",
  "answer": "Comprehensive answer with key details",
  "difficulty": "easy|medium|hard"
}

Requirements:
- Questions should be specific and educational
- Answers should be informative but concise
- Cover different aspects of the topic
- Use appropriate difficulty level
- Ensure accuracy and educational value

Example format:
[
  {
    "question": "What is the primary function of mitochondria in cells?",
    "answer": "Mitochondria are the powerhouses of the cell, responsible for producing ATP (adenosine triphosphate) through cellular respiration, providing energy for cellular processes.",
    "difficulty": "medium"
  }
]`;
}

function createQuizPrompt(topic: string, count: number, difficulty: string): string {
  return `Create a quiz about "${topic}" with ${count} multiple choice questions of ${difficulty} difficulty.

Return a JSON object with this exact structure:
{
  "title": "Quiz title about the topic",
  "description": "Brief description of what the quiz covers",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Include clear explanations for each answer
- Questions should test understanding, not just memorization
- Ensure all information is accurate

The quiz should comprehensively cover the topic "${topic}".`;
}

function createEnhancedFlashcardPrompt(topic: string, count: number, difficulty: string, features: any): string {
  const { includeCurrentEvents, factCheck, includeSources, targetAudience, contentFreshness } = features;
  
  let prompt = `Create ${count} educational flashcards about "${topic}" with ${difficulty} difficulty level.`;
  
  if (includeCurrentEvents) {
    prompt += ` Include current events, recent developments, and trending information related to this topic.`;
  }
  
  if (contentFreshness === 'latest') {
    prompt += ` Focus on the most recent information and developments from the last week.`;
  } else if (contentFreshness === 'recent') {
    prompt += ` Include recent information from the last month when relevant.`;
  }

  prompt += `\n\nReturn a JSON object with this exact structure:
{
  "flashcards": [
    {
      "question": "Clear, concise question",
      "answer": "Comprehensive answer with key details",
      "difficulty": "easy|medium|hard"`;

  if (includeSources) {
    prompt += `,
      "sources": [
        {
          "url": "https://example.com/article",
          "title": "Article title",
          "publishedDate": "2024-01-15T10:00:00Z",
          "reliability": 90,
          "snippet": "Brief excerpt from the article"
        }
      ]`;
  }

  if (factCheck) {
    prompt += `,
      "factCheckStatus": "verified|pending|disputed",
      "confidenceScore": 85`;
  }

  if (includeCurrentEvents) {
    prompt += `,
      "trendingnessScore": 75,
      "relatedTopics": ["related topic 1", "related topic 2"]`;
  }

  prompt += `
    }
  ]`;

  if (includeSources) {
    prompt += `,
  "sources": [
    {
      "url": "https://example.com/source",
      "title": "Source title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 90,
      "snippet": "Brief excerpt"
    }
  ]`;
  }

  if (factCheck) {
    prompt += `,
  "factCheckResults": [
    {
      "claim": "Specific claim being fact-checked",
      "status": "verified|disputed|unverified",
      "confidence": 90,
      "sources": [],
      "explanation": "Explanation of fact-check result"
    }
  ]`;
  }

  if (includeCurrentEvents) {
    prompt += `,
  "trendingnessScore": 80,
  "relatedTopics": ["trending topic 1", "trending topic 2"]`;
  }

  prompt += `
}

Requirements:
- Questions should be specific and educational for ${targetAudience} level
- Answers should be informative but concise
- Cover different aspects of the topic
- Use appropriate difficulty level
- Ensure accuracy and educational value`;

  if (includeSources) {
    prompt += `
- Include at least 2 reliable sources per flashcard
- Sources should be recent and authoritative
- Reliability score should be 0-100`;
  }

  if (factCheck) {
    prompt += `
- Verify all facts and provide confidence scores
- Flag any disputed or uncertain information
- Include explanations for fact-check results`;
  }

  if (includeCurrentEvents) {
    prompt += `
- Include trending information and current events
- Provide trendingness scores (0-100)
- Connect to related current topics`;
  }

  return prompt;
}

function createEnhancedQuizPrompt(topic: string, count: number, difficulty: string, features: any): string {
  const { includeCurrentEvents, factCheck, includeSources, targetAudience, contentFreshness } = features;
  
  let prompt = `Create a quiz about "${topic}" with ${count} multiple choice questions of ${difficulty} difficulty.`;
  
  if (includeCurrentEvents) {
    prompt += ` Include current events, recent developments, and trending information related to this topic.`;
  }
  
  if (contentFreshness === 'latest') {
    prompt += ` Focus on the most recent information and developments from the last week.`;
  } else if (contentFreshness === 'recent') {
    prompt += ` Include recent information from the last month when relevant.`;
  }

  prompt += `\n\nReturn a JSON object with this exact structure:
{
  "title": "Quiz title about the topic",
  "description": "Brief description of what the quiz covers",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"`;

  if (includeSources) {
    prompt += `,
      "sources": [
        {
          "url": "https://example.com/article",
          "title": "Article title",
          "publishedDate": "2024-01-15T10:00:00Z",
          "reliability": 90,
          "snippet": "Brief excerpt from the article"
        }
      ]`;
  }

  if (factCheck) {
    prompt += `,
      "factCheckStatus": "verified|pending|disputed",
      "confidenceScore": 85`;
  }

  if (includeCurrentEvents) {
    prompt += `,
      "relatedTopics": ["related topic 1", "related topic 2"]`;
  }

  prompt += `
    }
  ]`;

  if (includeSources) {
    prompt += `,
  "sources": [
    {
      "url": "https://example.com/source",
      "title": "Source title",
      "publishedDate": "2024-01-15T10:00:00Z",
      "reliability": 90,
      "snippet": "Brief excerpt"
    }
  ]`;
  }

  if (factCheck) {
    prompt += `,
  "factCheckResults": [
    {
      "claim": "Specific claim being fact-checked",
      "status": "verified|disputed|unverified",
      "confidence": 90,
      "sources": [],
      "explanation": "Explanation of fact-check result"
    }
  ]`;
  }

  if (includeCurrentEvents) {
    prompt += `,
  "trendingnessScore": 80,
  "relatedTopics": ["trending topic 1", "trending topic 2"]`;
  }

  prompt += `
}

Requirements:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Include clear explanations for each answer
- Questions should test understanding, not just memorization for ${targetAudience} level
- Ensure all information is accurate`;

  if (includeSources) {
    prompt += `
- Include reliable sources for each question
- Sources should be recent and authoritative
- Reliability score should be 0-100`;
  }

  if (factCheck) {
    prompt += `
- Verify all facts and provide confidence scores
- Flag any disputed or uncertain information
- Include explanations for fact-check results`;
  }

  if (includeCurrentEvents) {
    prompt += `
- Include trending information and current events
- Connect to related current topics
- Provide trendingness scores`;
  }

  prompt += `\n\nThe quiz should comprehensively cover the topic "${topic}".`;
  
  return prompt;
}

// Demo content generator for when API key is not configured
function generateDemoContent(topic: string, type: string = 'flashcards', count: number = 5, difficulty: string = 'medium', features: any = {}) {
  // Map difficulty to correct types
  const mappedDifficulty: 'easy' | 'medium' | 'hard' = 
    difficulty === 'beginner' ? 'easy' : 
    difficulty === 'advanced' || difficulty === 'expert' ? 'hard' : 'medium';

  const demoFlashcards: Flashcard[] = [
    {
      id: `demo-${Date.now()}-1`,
      question: `What is the main concept behind ${topic}?`,
      answer: `${topic} is a fundamental concept that involves understanding the key principles and applications in its field.`,
      difficulty: mappedDifficulty,
      topic,
      createdAt: new Date(),
      sources: [],
      lastUpdated: new Date(),
      trendingnessScore: 70,
      relatedCurrentTopics: [`Related to ${topic}`, 'Current trends'],
      factCheckStatus: 'verified',
      confidenceScore: 80
    },
    {
      id: `demo-${Date.now()}-2`,
      question: `How does ${topic} impact modern society?`,
      answer: `${topic} has significant implications for how we understand and interact with the world around us, influencing various aspects of daily life.`,
      difficulty: mappedDifficulty,
      topic,
      createdAt: new Date(),
      sources: [],
      lastUpdated: new Date(),
      trendingnessScore: 75,
      relatedCurrentTopics: [`${topic} applications`, 'Social impact'],
      factCheckStatus: 'verified',
      confidenceScore: 85
    },
    {
      id: `demo-${Date.now()}-3`,
      question: `What are the key benefits of understanding ${topic}?`,
      answer: `Understanding ${topic} provides valuable insights that can be applied in various contexts, enhancing problem-solving abilities and knowledge.`,
      difficulty: mappedDifficulty,
      topic,
      createdAt: new Date(),
      sources: [],
      lastUpdated: new Date(),
      trendingnessScore: 80,
      relatedCurrentTopics: [`Benefits of ${topic}`, 'Learning outcomes'],
      factCheckStatus: 'verified',
      confidenceScore: 90
    }
  ];

  // Adjust count and add more cards if needed
  const adjustedFlashcards = demoFlashcards.slice(0, Math.min(count, 3));
  
  // Add more demo cards if count > 3
  for (let i = 4; i <= count; i++) {
    adjustedFlashcards.push({
      id: `demo-${Date.now()}-${i}`,
      question: `Demo question ${i} about ${topic}?`,
      answer: `This is a demo answer about ${topic}. In a real implementation, this would contain detailed information about the topic.`,
      difficulty: mappedDifficulty,
      topic,
      createdAt: new Date(),
      sources: [],
      lastUpdated: new Date(),
      trendingnessScore: 60 + Math.floor(Math.random() * 30),
      relatedCurrentTopics: [`Demo topic ${i}`, `Related to ${topic}`],
      factCheckStatus: 'verified',
      confidenceScore: 70 + Math.floor(Math.random() * 20)
    });
  }

  return json({
    success: true,
    data: adjustedFlashcards,
    sources: [],
    trendingnessScore: 70,
    factCheckResults: [],
    relatedTopics: [`Related to ${topic}`, 'Demo content'],
    lastUpdated: new Date(),
    contentFreshness: features.contentFreshness || 'demo',
    isDemo: true
  });
} 