import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAnalystSystemPrompt } from '@/lib/utils/prompt-loader';

export const maxDuration = 60;

const openai = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
    const { prompt } = await req.json();
    const systemPrompt = await getAnalystSystemPrompt();

    const result = await generateObject({
        model: openai.chat('openai/gpt-4o-mini'),
        system: systemPrompt,
        prompt,
        schema: z.object({
            critical_flaw: z.string(),
            violated_axiom: z.string(),
            roast_fuel: z.string(),
            fixed_document_markdown: z.string(),
        }),
    });

    return Response.json(result.object);
}
