import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'operational',
        perplexity: env.PERPLEXITY_API_KEY ? 'configured' : 'demo-mode',
        database: 'operational' // Since we're using localStorage, this is always operational
      },
      features: {
        contentGeneration: true,
        fileUpload: true,
        authentication: true,
        gamification: true,
        trendingTopics: true,
        realTimeData: true
      }
    };

    return json(health);
  } catch (error) {
    return json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 