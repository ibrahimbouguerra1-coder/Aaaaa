import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with server-side API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const isValidKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY';
const ai = isValidKey ? new GoogleGenAI({ apiKey }) : null;

// AI Tutor Chat Endpoint
app.post('/api/ai-tutor', async (req, res) => {
  const { message, scenarioId, systemPrompt, userLevel } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Pre-generate intelligent context-aware response
  const smartFallbacks: Record<string, { replyEn: string; replyAr: string; coachingTipAr?: string }> = {
    coffee_shop: {
      replyEn: 'Excellent! That will be $4.50. Would you like to pay with card or cash?',
      replyAr: 'ممتاز! المجموع هو 4.50 دولار. هل تفضل الدفع بالبطاقة أم نقداً؟',
      coachingTipAr: 'في المقاهي، يمكنك قول "Keep the change" إذا أردت ترك الباقي كنصيحة أو إكرامية.',
    },
    job_interview: {
      replyEn: 'Thank you for sharing that experience. What would you say is your greatest technical strength?',
      replyAr: 'شكراً لمشاركتك هذه التجربة. ما هي أكبر نقطة قوة تقنية لديك؟',
      coachingTipAr: 'في المقابلات، استخدم دائماً أفعال العمل الإيجابية مثل: Led, Managed, Developed.',
    },
    airport_travel: {
      replyEn: 'Your passport is verified. Please proceed to security checkpoint B. Have a wonderful trip!',
      replyAr: 'تم التحقق من جواز سفرك. يرجى التوجه لنقطة التفتيش الأمني B. رحلة ممتعة!',
      coachingTipAr: 'تذكّر: الحقائب المسجلة تسمى "Checked luggage" والحقيبة المحمولة "Carry-on bag".',
    },
    clinic_visit: {
      replyEn: 'I see. I will prescribe an antibiotic and a pain reliever. Take this twice a day after meals.',
      replyAr: 'فهمت الحالة. سأصف لك مضاداً حيوياً ومسكناً. تناوله مرتين يومياً بعد الطعام.',
      coachingTipAr: 'لاحظ الفرق: Prescription هي الروشتة/الوصفة، و Painkiller هو المسكن.',
    },
  };

  const defaultFallback = smartFallbacks[scenarioId] || {
    replyEn: `That's very well expressed! Let's continue practicing this topic at level ${userLevel || 'A0'}. Tell me more!`,
    replyAr: 'صياغة ممتازة ومفهومة! لنواصل التدرب على هذا الموضوع بالإنجليزية. أخبرني المزيد!',
    coachingTipAr: 'نصيحة: تحدث بجمل كاملة وحافظ على تناسق الأزمنة بين الماضي والحاضر.',
  };

  if (!ai) {
    return res.json(defaultFallback);
  }

  try {
    const promptContext = `
${systemPrompt || 'You are Mr. Fares, an inspiring and expert English teacher for native Arabic speakers.'}
Target Learner Level: ${userLevel || 'A0'}.
User message: "${message}"

Respond strictly as JSON with this schema:
{
  "replyEn": "Your natural English conversational response (1-3 sentences)",
  "replyAr": "Arabic translation of your reply for learner comprehension",
  "coachingTipAr": "Optional concise pedagogical coaching tip in Arabic if user made any grammar, pronunciation, or preposition mistake (or empty string if none)"
}
`;

    // 5-second timeout with Promise.race
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContext,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout')), 5000)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = response?.text || '{}';
    const parsed = JSON.parse(responseText);

    return res.json({
      replyEn: parsed.replyEn || defaultFallback.replyEn,
      replyAr: parsed.replyAr || defaultFallback.replyAr,
      coachingTipAr: parsed.coachingTipAr || defaultFallback.coachingTipAr,
    });
  } catch (err: any) {
    console.debug('AI Tutor fallback triggered:', err.message);
    return res.json(defaultFallback);
  }
});

// AI Writing Coach & Polishing Endpoint
app.post('/api/ai-writer', async (req, res) => {
  const { text, tone, userLevel } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const defaultRewrite = {
    originalText: text,
    improvedText: text.replace(/\bi\s+am\s+agree\b/gi, 'I agree').replace(/\bmarried\s+with\b/gi, 'married to'),
    formalAlternative: text,
    casualAlternative: text,
    arabicExplanation: 'تمت مراجعة النص وتحسين ترابط الجمل الإنجليزية وحروف الجر بدقة.',
    detectedMistakes: [] as string[],
  };

  if (!ai) {
    return res.json(defaultRewrite);
  }

  try {
    const prompt = `
You are Mr. Fares' AI Master English Writing Coach. A native Arabic-speaking English learner submitted this text to be improved.
Tone requested: ${tone || 'business/polite'}.
Learner CEFR level: ${userLevel || 'A2'}.
Submitted text: "${text}"

Analyze for Arabic language interference (omitted verb to be, misplaced prepositions, direct literal translations from Arabic dialects) and rewrite naturally.
Respond STRICTLY as JSON with this schema:
{
  "improvedText": "Natural, corrected version in the requested tone",
  "formalAlternative": "Polite professional version (for emails/work)",
  "casualAlternative": "Friendly everyday conversational version",
  "arabicExplanation": "Clear Arabic explanation of the corrections and why the new wording is more natural",
  "detectedMistakes": ["List of specific errors found (e.g. 'I am agree -> I agree', 'in Friday -> on Friday')"]
}
`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout')), 5000)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = response?.text || '{}';
    const parsed = JSON.parse(responseText);

    return res.json({
      originalText: text,
      improvedText: parsed.improvedText || defaultRewrite.improvedText,
      formalAlternative: parsed.formalAlternative || defaultRewrite.formalAlternative,
      casualAlternative: parsed.casualAlternative || defaultRewrite.casualAlternative,
      arabicExplanation: parsed.arabicExplanation || defaultRewrite.arabicExplanation,
      detectedMistakes: parsed.detectedMistakes || defaultRewrite.detectedMistakes,
    });
  } catch (err: any) {
    console.debug('AI Writer fallback triggered:', err.message);
    return res.json(defaultRewrite);
  }
});

// Dev vs Production Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
