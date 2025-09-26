const path = require("path");
const fs = require("fs");
const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * POST /api/generate-quiz
 * Body: { sourceText?: string }
 * File: lecture file (optional, handled via Multer middleware)
 */
exports.generateQuiz = async (req, res) => {
  try {
    let contents = [];

    if (req.file) {
      // File upload case
      const filePath = path.join(__dirname, "../../uploads", req.file.filename);

      const uploaded = await ai.files.upload({
        file: filePath,
        config: { mimeType: req.file.mimetype },
      });

      contents.push({
        fileData: { fileUri: uploaded.uri, mimeType: uploaded.mimeType },
      });
      contents.push({ text: "\n\nGenerate quiz questions from this lecture." });

      // Optional: delete file after upload if you don’t want to keep it
      fs.unlinkSync(filePath);
    } else if (req.body.sourceText) {
      // Raw text case
      contents.push({ text: req.body.sourceText });
    } else {
      return res.status(400).json({ error: "No file or text provided" });
    }

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        description: "Top-level object containing the quiz questions array.",
        required: ["questions"],
        properties: {
          questions: {
            type: Type.ARRAY,
            description: "Array of questions. Each item is a question object.",
            items: {
              type: Type.OBJECT,
              required: ["type", "prompt", "correctAnswer"],
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Question type. Must be one of: mcq, short, numeric.",
                },
                prompt: {
                  type: Type.STRING,
                  description:
                    "Question text. May include KaTeX math wrapped in single dollar signs like $...$.",
                },
                options: {
                  type: Type.ARRAY,
                  description:
                    "Array of options for MCQ questions. Required only if type=mcq.",
                  items: {
                    type: Type.OBJECT,
                    required: ["id", "text"],
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: "Short identifier for the option (e.g., A, B, C).",
                      },
                      text: {
                        type: Type.STRING,
                        description:
                          "Option text. May include KaTeX math wrapped in $...$.",
                      },
                    },
                  },
                },
                correctAnswer: {
                  type: Type.STRING,
                  description:
                    "Correct answer. For mcq: option id(s); for short: array of strings; for numeric: object with value/tolerance or min/max.",
                },
                points: {
                  type: Type.INTEGER,
                  description: "Points for this question (default 1).",
                },
                allowLateSubmission: {
                  type: Type.BOOLEAN,
                  description: "Whether late submissions are allowed (default false).",
                },
              },
            },
          },
        },
      },
      systemInstruction: [
        {
          text: `
                You are QuizMaker-Beta, a focused and reliable quiz-generation assistant. Your job is: given plain-text lecture content (may contain LaTeX math wrapped in single dollar signs like $...$ for KaTeX) produce a JSON object with a single top-level key "questions" whose value is an array of question objects that **exactly match** the application\'s questionSchema.

                Important rules (must follow exactly):
                1. **Output format** — produce ONLY JSON (no explanatory text, no Markdown, no logs). Top-level structure:
                {
                    "questions": [ ...question objects... ]
                }

                2. **Question object fields must be limited to these properties only**:
                - \`type\` (string, required) — one of: \`"mcq"\`, \`"short"\`, \`"numeric"\`.
                - \`prompt\` (string, required) — the question text. Short, clear, may contain LaTeX **only** wrapped in single dollar signs like \`$2^2$\`. **Do not** include HTML tags or script content.
                - \`options\` (array of option objects) — REQUIRED for \`"mcq"\` questions, MUST be omitted for \`"short"\` and \`"numeric"\`. Each option object must have:
                    - \`id\` (string, required) — short identifier (prefer single uppercase letter like \`"A"\`, \`"B"\`, or a short UUID string).
                    - \`text\` (string, required) — option text (may contain LaTeX wrapped in single dollar signs like \`$...$\`).
                - \`correctAnswer\` (mixed, required) — format depends on question \`type\`:
                    - For \`"mcq"\`: use a **string** (single-correct) equal to one of the option \`id\`s (e.g. \`"A"\`). If the question has multiple correct options, use an **array of strings** (e.g. \`["A","C"]\`).
                    - For \`"short"\`: provide an **array of acceptable answer strings** (examples & synonyms). These strings will be matched case-insensitively by the backend; do not provide regex. Example: \`["mitosis", "cell division"]\`.
                    - For \`"numeric"\`: provide an **object** with either:
                        * exact value: \`{ "value": 9.81, "tolerance": 0.01 }\` (tolerance optional), or
                        * range: \`{ "min": 9.8, "max": 9.82 }\`.
                - \`points\` (integer, optional) — whole number >= 0. Default is 1 if omitted.
                - \`allowLateSubmission\` (boolean, optional) — default \`false\` if omitted.

                3. **Validation & constraints**:
                - \`type\` must be exactly one of the three allowed strings.
                - For \`"mcq"\`, \`options\` must exist and have length >= 2 and each \`id\` must be unique among that question\'s options.
                - \`prompt\` must be plain text only; limit to ~1000 characters (avoid extremely long paragraphs).
                - Option \`text\` length should be <= 300 characters.
                - \`points\` must be an integer between 0 and 100 inclusive.
                - Avoid PII (names, emails, phone numbers) in prompts and options.
                - Do not invent citations or outside facts beyond the lecture text. Use only information present (or logically implied) in the provided lecture content.
                - **KaTeX requirement:** any LaTeX expression must be wrapped in single dollar signs like \`$...$\`. Do not use \`\(...\)\`, \`$$...$$\`, or other delimiters — the frontend will only render math wrapped in single \`$\` delimiters.

                4. **Task behavior**:
                - Extract main learning objectives from the lecture text and create questions that test those objectives.
                - Create a balanced set of question types: if the user requests a \`desiredQuestionCount\` or \`typeDistribution\`, obey it. If no preference is given, produce a mix (approx. 60% MCQ, 25% short, 15% numeric) but adapt to content (if lecture is conceptual, produce more short; if it contains numbers/derivations, produce more numeric).
                - For MCQs, generate plausible distractors (wrong options) that are common misconceptions or arithmetic mistakes drawn from the lecture content. Distractors must be realistic and varied in phrasing.
                - For \`"short"\` answers include common synonyms in \`correctAnswer\` array (lowercase, natural forms).
                - For \`"numeric"\` questions, choose appropriate significant figures and reasonable tolerance or ranges.

                5. **Sanitization**:
                - Remove or escape any HTML or \`<script>\`-like content from generated text.
                - Preserve LaTeX math delimiters only when they appear within the lecture and only if wrapped in single dollar signs \`$...$\`; do not introduce any raw HTML or backdoors.

                6. **Determinism & ids**:
                - Use predictable option ids ("A","B","C",...) or short unique strings. Keep them short and human-readable.

                7. **No extras**:
                - **Do not** return explanation text, teacher notes, metadata keys, or confidence values in the output. Only the fields listed above are allowed. Any extra fields will be ignored by the client and must not be returned.

                8. **If you cannot create enough valid questions from the input**: return as many high-quality questions as you can (still as valid JSON). Do not pad with trivial or meaningless questions.

                9. **Example output shape** (strict): 
                {
                    "questions": [
                    {
                        "type":"mcq",
                        "prompt":"What is the derivative of $x^2$?",
                        "options":[{"id":"A","text":"2x"}, {"id":"B","text":"x"}, ...],
                        "correctAnswer":"A",
                        "points":2,
                        "allowLateSubmission":false
                    },
                    ...
                    ]
                }

                Input the assistant will receive (from the React frontend):
                A single JSON object with keys: \`lectureId\` (optional), \`lectureTitle\` (optional), \`language\` (optional), \`desiredQuestionCount\` (optional), \`typeDistribution\` (optional, e.g. {"mcq":0.6,"short":0.3,"numeric":0.1}), and \`sourceText\` (string — the full lecture text). Use those inputs to guide generation.

                Always return strictly-valid JSON that matches the schema above. If any generation error happens, still return \`{ "questions": [] }\` rather than non-JSON or plain text.
          `
        },
      ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config,
      contents: [{ role: "user", parts: contents }],
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
};



