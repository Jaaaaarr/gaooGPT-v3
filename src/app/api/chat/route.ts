import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, convertToCoreMessages } from 'ai';
import { getGaooSystemPrompt } from '@/lib/utils/prompt-loader';

import { z } from 'zod';

export const maxDuration = 30;

const openai = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'GaooGPT',
    },
});

export async function POST(req: Request) {
    const body = await req.json();
    const { messages, analystReport, enmaCho } = body;

    if (!messages || !Array.isArray(messages)) {
        console.error('Invalid messages format');
        return new Response(JSON.stringify({
            error: 'Invalid messages format',
            receivedKeys: Object.keys(body),
            messagesType: typeof messages
        }), { status: 400 });
    }

    const systemPrompt = await getGaooSystemPrompt({
        analystReport: analystReport ? JSON.stringify(analystReport) : undefined,
        enmaCho: enmaCho ? JSON.stringify(enmaCho) : undefined
    });

    try {
        const coreMessages = messages.map((m: any) => {
            let content = m.content;

            // Handle content being an array (some clients do this)
            if (Array.isArray(content)) {
                content = content
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
            }
            // Handle parts if content is missing or empty
            else if ((!content || content === '') && m.parts && Array.isArray(m.parts)) {
                content = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
            }

            return {
                role: m.role,
                content: typeof content === 'string' ? content : '',
            };
        });

        const result = streamText({
            model: openai.chat('openai/gpt-4o-mini'), // Use .chat() to force /chat/completions endpoint
            system: systemPrompt,
            messages: coreMessages,
            // tools: {
            //     updateEnmaCho: tool({
            //         description: 'Call this tool to update the user\'s state (e.g., decrease patience, set active interrogation question).',
            //         parameters: z.object({
            //             action: z.enum(['decrease_patience', 'set_interrogation', 'clear_interrogation']),
            //             value: z.string().optional(),
            //         }),
            //         execute: async ({ action, value }) => {
            //             // Tool logic disabled for now
            //             return { status: 'success', action, value };
            //         },
            //     }),
            // },
            onError: (error) => {
                console.error('Stream error:', error);
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 500 });
    }
}
