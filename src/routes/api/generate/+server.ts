import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { GenerateRequest, GenerateResponse, Flashcard, Quiz, PerplexityRequest } from '$lib/types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const generateRequest: GenerateRequest = await request.json();
    const { topic, type, count = 10, difficulty = 'mixed' } = generateRequest;

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

    console.log('✅ Using Perplexity API with key starting with:', PERPLEXITY_API_KEY.substring(0, 8) + '...');

    const prompt = type === 'flashcards' 
      ? createFlashcardPrompt(topic, count, difficulty)
      : createQuizPrompt(topic, count, difficulty);

    const perplexityRequest: PerplexityRequest = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Generate high-quality, accurate educational content in valid JSON format only. Do not include any text outside the JSON response.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
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

    if (type === 'flashcards') {
      const flashcards: Flashcard[] = generatedContent.map((item: any, index: number) => ({
        id: `flashcard-${Date.now()}-${index}`,
        question: item.question,
        answer: item.answer,
        difficulty: item.difficulty || difficulty,
        topic,
        createdAt: new Date()
      }));

      return json({
        success: true,
        data: flashcards
      } as GenerateResponse);
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
          explanation: q.explanation
        })),
        topic,
        timeLimit: 30, // 30 minutes default
        createdAt: new Date()
      };

      return json({
        success: true,
        data: quiz
      } as GenerateResponse);
    }

  } catch (error) {
    console.error('Generate API error:', error);
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