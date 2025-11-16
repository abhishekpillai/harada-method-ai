import OpenAI from 'openai';

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // For client-side usage
  });
}

export interface GeneratePillarsParams {
  goal: string;
  onPillarGenerated: (pillarTitle: string, pillarIndex: number) => void;
  onComplete: (pillars: string[]) => void;
  onError: (error: Error) => void;
}

export async function generatePillars(
  client: OpenAI,
  { goal, onPillarGenerated, onComplete, onError }: GeneratePillarsParams
) {
  try {
    const stream = await client.chat.completions.create({
      model: 'gpt-5-nano',
      reasoning_effort: 'minimal', // Fastest, most cost-efficient
      messages: [
        {
          role: 'system',
          content: `You are an expert in the Harada Method, a Japanese goal-setting framework.
          Given a central goal, identify 8 critical supporting pillars (categories) needed to achieve it.

          Return ONLY a JSON array of 8 pillar titles, each being a short phrase (2-4 words).
          Format: ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4", "Pillar 5", "Pillar 6", "Pillar 7", "Pillar 8"]

          Examples of good pillars:
          - Physical (Body, Nutrition, Stamina, Core Strength)
          - Mental (Mental Toughness, Focus, Discipline)
          - Skills (Technical Skills, Tactical Skills)
          - Character (Personality, Karma, Humility)

          Make them specific and actionable for the given goal.`
        },
        {
          role: 'user',
          content: `Goal: ${goal}\n\nGenerate 8 supporting pillars:`
        }
      ],
      stream: true,
    });

    let accumulatedText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      accumulatedText += content;
    }

    // Parse the JSON response
    const pillars: string[] = JSON.parse(accumulatedText.trim());

    // Emit each pillar with a small delay for animation
    for (let i = 0; i < pillars.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onPillarGenerated(pillars[i], i);
    }

    onComplete(pillars);
  } catch (error) {
    onError(error as Error);
  }
}

export interface GenerateTasksParams {
  goal: string;
  pillarTitle: string;
  pillarIndex: number;
  onTaskGenerated: (task: string, pillarIndex: number, taskIndex: number) => void;
  onComplete: (tasks: string[], pillarIndex: number) => void;
  onError: (error: Error) => void;
}

export async function generateTasks(
  client: OpenAI,
  { goal, pillarTitle, pillarIndex, onTaskGenerated, onComplete, onError }: GenerateTasksParams
) {
  try {
    const stream = await client.chat.completions.create({
      model: 'gpt-5-nano',
      reasoning_effort: 'minimal', // Fastest, most cost-efficient
      messages: [
        {
          role: 'system',
          content: `You are an expert in the Harada Method. Given a goal and one supporting pillar,
          generate 8 specific, actionable daily tasks or habits that support that pillar.

          Return ONLY a JSON array of 8 tasks, each being a clear, actionable item (3-8 words).
          Format: ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5", "Task 6", "Task 7", "Task 8"]

          Tasks should be:
          - Concrete and measurable
          - Daily habits or routines when possible
          - Specific to the pillar and goal
          - Actionable (start with verbs like "Practice", "Develop", "Maintain", etc.)

          Example tasks:
          - "Practice 30 min daily"
          - "Track progress weekly"
          - "Get 8 hours sleep"
          - "Reflect on performance"`
        },
        {
          role: 'user',
          content: `Goal: ${goal}\nPillar: ${pillarTitle}\n\nGenerate 8 actionable tasks:`
        }
      ],
      stream: true,
    });

    let accumulatedText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      accumulatedText += content;
    }

    // Parse the JSON response
    const tasks: string[] = JSON.parse(accumulatedText.trim());

    // Emit each task with a small delay for ripple animation
    for (let i = 0; i < tasks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      onTaskGenerated(tasks[i], pillarIndex, i);
    }

    onComplete(tasks, pillarIndex);
  } catch (error) {
    onError(error as Error);
  }
}
