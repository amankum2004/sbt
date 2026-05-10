const axios = require("axios");

const SYSTEM_PROMPT = `You are SalonHub Assistant, a helpful chatbot for SalonHub — India's online salon appointment booking platform.

About SalonHub:
- Users can discover nearby salons, browse services, and book time slots online
- Salon owners can register their shop, create time slots, manage appointments, and post job openings
- The platform supports haircuts, facials, beard grooming, hair coloring, waxing, spa treatments, and more
- Users can view ratings and reviews before booking
- Payments are handled securely via Razorpay
- The job portal lets salon owners post jobs and users can apply directly

You can help users with:
- How to book an appointment
- How to find salons near them
- How to register a salon
- How to use the job portal (find jobs, apply, post jobs)
- General questions about salon services
- Account and profile related questions
- Cancellation and refund policies
- How to leave a review

Keep responses concise, friendly, and helpful. If a question is completely unrelated to SalonHub or salons, politely redirect the user back to salon-related topics. Do not make up specific prices or availability — direct users to check the platform for live data.`;

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "Messages are required" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: "Chat service is not configured. Add GROQ_API_KEY to your .env file." });
    }

    // Groq uses the OpenAI-compatible chat completions format
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 512,
      },
      {
        timeout: 20000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response. Please try again.";

    return res.json({ success: true, reply });
  } catch (error) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.error?.message || error.message;
    console.error(`Chat error [${status}]:`, detail);

    if (status === 429) {
      return res.status(429).json({ success: false, message: "Too many requests. Please wait a moment and try again." });
    }
    if (status === 401) {
      return res.status(503).json({ success: false, message: "Invalid API key. Please check your GROQ_API_KEY." });
    }

    return res.status(500).json({ success: false, message: "Chat service unavailable. Please try again." });
  }
};
