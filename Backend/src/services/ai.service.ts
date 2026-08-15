import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from '../utils/custom-errors';
import { studyPlanOutputSchema } from '../validations/ai.validation';
import {
  workoutSplitAiOutputSchema,
  workoutSessionAiOutputSchema,
  detectEquipmentOutputSchema,
  regenerateSplitOutputSchema,
} from '../validations/workoutAi.validation';

function getOpenAIClient(): OpenAI {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError(503, 'AI features are unavailable: GEMINI_API_KEY is not configured on the server.');
  }
  return new OpenAI({
    apiKey,
    baseURL: env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    timeout: 15000, // 15s timeout
  });
}

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelayMs = 1500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.statusCode === 429 ||
        (typeof error?.message === 'string' && error.message.includes('429'));

      attempt++;
      if (isRateLimit && attempt <= maxRetries) {
        const waitMs = initialDelayMs * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, waitMs));
        continue;
      }

      if (isRateLimit) {
        throw new AppError(429, 'Gemini AI rate limit reached. Please wait a moment and try again.');
      }

      if (error?.code === 'ETIMEDOUT' || (typeof error?.message === 'string' && error.message.includes('timeout'))) {
        throw new AppError(504, 'AI request timed out. Please try again.');
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(500, error?.message || 'AI service error encountered.');
    }
  }
}

export interface GenerateCoverLetterInput {
  jobDescription: string;
  userProfile?: string;
  company?: string;
  role?: string;
}

export interface GenerateResumeBulletsInput {
  jobDescription: string;
  rawExperience: string;
  company?: string;
  role?: string;
}

export interface GenerateStudyPlanInput {
  topicName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export class AIService {
  private static get modelName(): string {
    return env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

  static async generateCoverLetter(input: GenerateCoverLetterInput): Promise<string> {
    const openai = getOpenAIClient();

    const systemPrompt = `You are a professional career coach and copywriter specializing in high-converting cover letters. 
Write a polished, professional, and compelling cover letter tailored to the job description and user background provided.
Guidelines:
- Maintain a clear, concise, and enthusiastic tone.
- Do NOT include place-holder tags like "[Date]" or "[Hiring Manager Name]" if avoidable — write a clean opening suitable for immediate use.
- Highlight relevant key skills matching the job requirements.
- Keep the length between 250 to 400 words.`;

    const userPrompt = `
Target Company: ${input.company || 'Target Company'}
Target Role: ${input.role || 'Target Role'}

Job Description:
${input.jobDescription}

User Background / Experience / Resume Notes:
${input.userProfile || 'Dynamic professional with experience in software development and problem solving.'}
`;

    return callWithRetry(async () => {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new AppError(500, 'AI returned an empty cover letter response.');
      }
      return content;
    });
  }

  static async generateResumeBullets(input: GenerateResumeBulletsInput): Promise<string[]> {
    const openai = getOpenAIClient();

    const systemPrompt = `You are an expert resume consultant. 
Given a job description and raw experience notes, generate 3 to 5 tailored, action-oriented resume bullet points highlighting relevant achievements and technical skills.
Rules:
- Respond strictly with a valid JSON array of strings, e.g. ["Bullet 1", "Bullet 2", "Bullet 3"].
- Do NOT output any markdown formatting, preambles, or extra text. Output ONLY raw JSON array.
- Use strong action verbs (e.g. Architected, Developed, Optimized, Streamlined).
- Include metrics or outcomes where plausible.`;

    const userPrompt = `
Target Company: ${input.company || 'Target Company'}
Target Role: ${input.role || 'Target Role'}

Job Description:
${input.jobDescription}

Raw Experience Notes:
${input.rawExperience}
`;

    return callWithRetry(async () => {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new AppError(500, 'AI returned an empty resume bullets response.');
      }

      // Clean string if wrapped in markdown code fence ```json ... ```
      let cleaned = content;
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }

      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
          return parsed.slice(0, 5);
        }
      } catch (err) {
        // Fallback: split content by newlines or bullet symbols if JSON parsing fails
      }

      const fallbackBullets = cleaned
        .split('\n')
        .map((line) => line.replace(/^[-*•\d.\s]+/, '').trim())
        .filter((line) => line.length > 5)
        .slice(0, 5);

      if (fallbackBullets.length === 0) {
        throw new AppError(500, 'Failed to parse structured resume bullets from AI output.');
      }

      return fallbackBullets;
    });
  }

  static async generateStudyPlan(input: GenerateStudyPlanInput): Promise<{ title: string }[]> {
    const openai = getOpenAIClient();

    const systemPrompt = `You are an expert curriculum designer and educator.
Generate a structured list of sub-topics for the study topic requested, tailored to the specified skill level.

Rules:
- You MUST respond strictly with a valid JSON object containing a "subTopics" array.
- Each element in the "subTopics" array must be an object containing a "title" string.
- Do NOT include any markdown formatting, preambles, or postscripts. Respond ONLY with raw JSON.
- Respond with exactly the following JSON structure:
  {
    "subTopics": [
      { "title": "Subtopic Title 1" },
      { "title": "Subtopic Title 2" }
    ]
  }
- Generate between 5 and 10 relevant, sequential, and clear sub-topics.
- Ensure the sub-topics are appropriate for a "${input.skillLevel}" level.`;

    const userPrompt = `Generate a study plan for: "${input.topicName}" at a "${input.skillLevel}" level.`;

    let attempts = 0;
    while (attempts < 2) {
      try {
        const response = await callWithRetry(async () => {
          return await openai.chat.completions.create({
            model: AIService.modelName,
            messages: [
              { role: 'system', content: attempts === 0 ? systemPrompt : `${systemPrompt}\nIMPORTANT: Your previous output was malformed. You MUST return valid JSON exactly matching the requested schema. No markdown wrappers.` },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
          });
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
          throw new AppError(500, 'AI returned an empty study plan response.');
        }

        const parsed = JSON.parse(content);
        const validated = studyPlanOutputSchema.parse(parsed);
        return validated.subTopics;
      } catch (error: any) {
        attempts++;
        if (attempts >= 2) {
          if (error instanceof AppError) {
            throw error;
          }
          throw new AppError(502, `Failed to generate a valid study plan from AI: ${error.message || 'Malformed JSON output'}`);
        }
      }
    }

    throw new AppError(502, 'Failed to generate a valid study plan from AI.');
  }

  // 1. Generate workout split
  static async generateWorkoutSplit(input: {
    daysPerWeek: number;
    goal: string;
    experienceLevel: string;
  }): Promise<any> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are an elite personal trainer. Generate a weekly workout split (monday to sunday) based on the user's details.
The response MUST be a JSON object containing a "weekMap" key. Each day (monday to sunday) must map to a target muscle group focus or "rest".
Use these valid muscle groups: Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core, Cardio, FullBody, rest.
JSON response format: { "weekMap": { "monday": string, "tuesday": string, ... } }`;

    const userPrompt = `Generate a split with ${input.daysPerWeek} training days. Goal is ${input.goal} and experience level is ${input.experienceLevel}.`;

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty split response.');
      }
      const parsed = JSON.parse(content);
      const validated = workoutSplitAiOutputSchema.parse(parsed);
      return validated.weekMap;
    } catch (error: any) {
      throw new AppError(502, `Failed to generate workout split: ${error.message}`);
    }
  }

  // 2. Generate workout session (with progressive overload and injury awareness)
  static async generateWorkoutSession(input: {
    date: string;
    muscleGroup: string;
    equipment: string[];
    fitnessLevel: string;
    prevSessionSummary?: string;
    painFlags?: string[];
  }): Promise<any> {
    const openai = getOpenAIClient();
    let systemPrompt = `You are a professional fitness coach. Generate a structured workout session matching the exact schema.
You MUST return a JSON object with this shape:
{
  "muscleGroup": "${input.muscleGroup}",
  "durationMinutes": number,
  "exercises": [
    {
      "exerciseName": "Exercise Name",
      "sets": [
        { "setNumber": 1, "reps": number, "weightKg": number, "completed": false }
      ],
      "notes": "Instruction/Form tips"
    }
  ]
}`;

    if (input.painFlags && input.painFlags.length > 0) {
      systemPrompt += `\nCRITICAL INSTRUCTION: The user has pain/soreness in the following areas: ${input.painFlags.join(', ')}.
Avoid or substitute any exercises that put direct or heavy load on these body parts. In each substituted exercise's "notes" field, explicitly explain why you chose this substitute due to the soreness/pain.`;
    }

    let userPrompt = `Create a ${input.muscleGroup} workout for a ${input.fitnessLevel} level user using equipment: ${input.equipment.join(', ')}.`;
    if (input.prevSessionSummary) {
      userPrompt += `\nHere is a summary of the user's previous session for this muscle group:
${input.prevSessionSummary}
CRITICAL: Apply progressive overload based on this previous workout. E.g. increase weight by 1-2.5kg, or add 1-2 reps for sets, or adjust sets, rather than generating a random routine. Make the progression realistic and safe.`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty workout session response.');
      }
      const parsed = JSON.parse(content);
      const validated = workoutSessionAiOutputSchema.parse(parsed);
      return validated;
    } catch (error: any) {
      throw new AppError(502, `Failed to generate workout session: ${error.message}`);
    }
  }

  // 3. Generate workout insights
  static async generateWorkoutInsights(workoutHistorySummary: string): Promise<any> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are a fitness analyst. Analyze the user's recent workout sessions and output constructive insights.
Provide a high-level summary of their consistency and volume, and a list of specific actionable recommendations (e.g. progressive overload adjustments, muscle imbalance tips).
Output format MUST be a JSON object with:
{
  "summary": "High-level summary...",
  "recommendations": [
    { "exerciseName": "Exercise Name", "action": "Increase weight/reps/rest", "detail": "Detailed explanation" }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this workout history:\n${workoutHistorySummary}` }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty insights response.');
      }
      return JSON.parse(content);
    } catch (error: any) {
      throw new AppError(502, `Failed to generate workout insights: ${error.message}`);
    }
  }

  // 4. Parse workout log
  static async parseWorkoutLog(input: { rawText: string; date: string }): Promise<any> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are a workout log parsing utility. Parse the user's raw text description of their workout session into a structured format matching this schema:
{
  "muscleGroup": "Muscle Group identified",
  "durationMinutes": number,
  "exercises": [
    {
      "exerciseName": "Exercise Name",
      "sets": [
        { "setNumber": 1, "reps": number, "weightKg": number, "completed": true }
      ],
      "notes": "notes if any"
    }
  ]
}
If reps or weight is missing, default to 0. Set all completed sets to true.`;

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this workout: "${input.rawText}" performed on date ${input.date}` }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty parse response.');
      }
      const parsed = JSON.parse(content);
      const validated = workoutSessionAiOutputSchema.parse(parsed);
      return validated;
    } catch (error: any) {
      throw new AppError(502, `Failed to parse workout log: ${error.message}`);
    }
  }

  // 5. Deload week recommendation (for plateau)
  static async generateDeloadWeek(input: {
    affectedExercises: string[];
    muscleGroup: string;
    prevSessionSummary: string;
  }): Promise<any> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are a fitness coach designing a Deload session for a user who hit a plateau.
Create a deload workout session for ${input.muscleGroup} targeting the plateaued exercises: ${input.affectedExercises.join(', ')}.
You MUST significantly reduce the volume/intensity (e.g. reduce sets by 30-50% or drop weights to 60-70% of the previous weight).
Ensure the output matches this schema shape:
{
  "muscleGroup": "${input.muscleGroup}",
  "durationMinutes": number,
  "exercises": [
    {
      "exerciseName": "Exercise Name",
      "sets": [
        { "setNumber": 1, "reps": number, "weightKg": number, "completed": false }
      ],
      "notes": "Deload instructions (e.g., 'Focus on pure control. Focus on joint recovery.')"
    }
  ]
}`;

    const userPrompt = `Create a deload workout. Here is the summary of their normal/previous session:
${input.prevSessionSummary}`;

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty deload plan response.');
      }
      const parsed = JSON.parse(content);
      const validated = workoutSessionAiOutputSchema.parse(parsed);
      return validated;
    } catch (error: any) {
      throw new AppError(502, `Failed to generate deload workout: ${error.message}`);
    }
  }

  // 6. Multimodal vision-based equipment detection
  static async detectEquipment(base64Image: string): Promise<string[]> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are a gym equipment scanner. Analyze the provided image of gym equipment/room and identify all visible types.
Choose ONLY from this restricted enum list: Dumbbell, Machine, Barbell, Bodyweight, Kettlebell, Bands, Cable.
Return a JSON object matching this schema:
{
  "detectedEquipment": ["Dumbbell", "Machine", ...]
}
If no matching equipment is found, return an empty array. Do not output anything outside this list.`;

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty vision response.');
      }
      const parsed = JSON.parse(content);
      const validated = detectEquipmentOutputSchema.parse(parsed);
      return validated.detectedEquipment;
    } catch (error: any) {
      throw new AppError(502, `Failed to detect equipment from image: ${error.message}`);
    }
  }

  // 7. AI Workout Coach Chat
  static async coachChat(historyMessages: { role: 'user' | 'assistant'; content: string }[], newMessage: string): Promise<string> {
    const openai = getOpenAIClient();
    const systemInstruction = `You are Swappy, a professional AI Workout Coach. Your role is strictly to answer fitness, gym, training programs, workout routines, exercise form, and sports nutrition questions.
Politely but firmly decline to answer any questions outside of these workout/fitness domains (e.g. coding, history, politics, general chats). Keep responses concise, structured, and highly encouraging.`;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMessages,
      { role: 'user', content: newMessage }
    ];

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: messages as any
      });

      const reply = response.choices[0]?.message?.content;
      if (!reply) {
        throw new AppError(500, 'AI Coach did not return a response.');
      }
      return reply;
    } catch (error: any) {
      throw new AppError(502, `Workout coach connection failed: ${error.message}`);
    }
  }

  // 8. Regenerate split based on compliance trends
  static async regenerateSplit(weekMap: any, lowDaysSummary: string): Promise<any> {
    const openai = getOpenAIClient();
    const systemPrompt = `You are a fitness coach. Adjust the user's weekly workout split to be more realistic and manageable, because they are failing to complete their workouts on certain days.
You will receive their current weekMap (monday to sunday) and a summary of the low-compliance days.
Modify the split to lower the load, reorganize days, or change a low-compliance day to "rest".
Explain the logic behind your change in exactly one sentence.
Use these valid muscle groups: Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core, Cardio, FullBody, rest.
Output format MUST be a JSON object with:
{
  "weekMap": { "monday": string, "tuesday": string, ... },
  "explanation": "One sentence explanation of the adjustments."
}`;

    const userPrompt = `Current Split weekMap: ${JSON.stringify(weekMap)}
Low compliance days summary: ${lowDaysSummary}`;

    try {
      const response = await openai.chat.completions.create({
        model: AIService.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError(500, 'AI returned empty split regeneration response.');
      }
      const parsed = JSON.parse(content);
      const validated = regenerateSplitOutputSchema.parse(parsed);
      return validated;
    } catch (error: any) {
      throw new AppError(502, `Failed to regenerate split: ${error.message}`);
    }
  }
}
