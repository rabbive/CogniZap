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
    if (!PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
      return json({
        success: false,
        error: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your .env file.'
      } as GenerateResponse, { status: 500 });
    }

    if (PERPLEXITY_API_KEY === 'your_actual_api_key_here') {
      console.error('❌ PERPLEXITY_API_KEY is still using placeholder value');
      return json({
        success: false,
        error: 'Please replace the placeholder API key in your .env file with your actual Perplexity API key.'
      } as GenerateResponse, { status: 500 });
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
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const perplexityResponse = await response.json();
    const content = perplexityResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Parse the JSON response
    const generatedContent = JSON.parse(content.trim());

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
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate content'
    } as GenerateResponse, { status: 500 });
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