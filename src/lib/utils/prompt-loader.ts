import fs from 'fs/promises';
import path from 'path';

export async function getGaooSystemPrompt(context?: { analystReport?: string; enmaCho?: string }): Promise<string> {
  const promptsDir = path.join(process.cwd(), 'src/lib/prompts');

  try {
    const [actorPrompt, axioms, voice] = await Promise.all([
      fs.readFile(path.join(promptsDir, 'gaoo_actor_prompt.md'), 'utf-8'),
      fs.readFile(path.join(promptsDir, 'gaoo_axioms_jp.md'), 'utf-8'),
      fs.readFile(path.join(promptsDir, 'gaoo_voice_jp.md'), 'utf-8'),
    ]);

    let systemPrompt = actorPrompt
      .replace('{{GAOO_AXIOMS}}', axioms)
      .replace('{{GAOO_VOICE}}', voice);

    // Inject context if available
    if (context?.analystReport) {
      systemPrompt = systemPrompt.replace('{{ANALYST_JSON_OUTPUT}}', context.analystReport);
    } else {
      systemPrompt = systemPrompt.replace('{{ANALYST_JSON_OUTPUT}}', '(No Analyst Report Available)');
    }

    if (context?.enmaCho) {
      systemPrompt = systemPrompt.replace('{{USER_STATE_JSON}}', context.enmaCho);
    } else {
      systemPrompt = systemPrompt.replace('{{USER_STATE_JSON}}', '(No User State Available)');
    }

    return systemPrompt;
  } catch (error) {
    console.error('Error loading prompts:', error);
    throw new Error('Failed to load system prompt');
  }
}

export async function getAnalystSystemPrompt(): Promise<string> {
  const promptsDir = path.join(process.cwd(), 'src/lib/prompts');

  try {
    const [analystPrompt, axioms] = await Promise.all([
      fs.readFile(path.join(promptsDir, 'gaoo_analyst_prompt.md'), 'utf-8'),
      fs.readFile(path.join(promptsDir, 'gaoo_axioms_jp.md'), 'utf-8'),
    ]);

    return analystPrompt.replace('{{GAOO_AXIOMS}}', axioms);
  } catch (error) {
    console.error('Error loading analyst prompt:', error);
    throw new Error('Failed to load analyst prompt');
  }
}
