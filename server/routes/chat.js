const express = require("express");
const { HUNTER_NAVIGATOR_SYSTEM_PROMPT } = require("../prompts/hunterNavigator");

const router = express.Router();

function normalizeResource(resource) {
  if (!resource || typeof resource !== "object") {
    return null;
  }

  return {
    name: resource.name || resource.Name || "",
    category: resource.category || resource.Category || "",
    campus: resource.campus || resource.Campus || "",
    hours: resource.hours || resource.Hours || "",
    eligibility: resource.eligibility || resource.Eligibility || resource.eligibilitySummary || "",
    requiredDocs:
      resource.requiredDocs || resource["Required Docs"] || resource.RequiredDocs || "",
    url: resource.url || resource.URL || resource.sourceUrl || "",
    description: resource.description || resource.Description || "",
  };
}

function buildFallbackReply({ question, matchedResources, resourceCatalog }) {
  const topMatches = Array.isArray(matchedResources)
    ? matchedResources.slice(0, 3).map((resource) => normalizeResource(resource)).filter(Boolean)
    : [];
  const alternatives = Array.isArray(resourceCatalog)
    ? resourceCatalog
        .slice(0, 3)
        .map((resource) => normalizeResource(resource))
        .filter(Boolean)
    : [];

  if (!topMatches.length && !alternatives.length) {
    return `I could not find a strong match yet. Please tell me more about what you need, and I’ll help narrow it down.`;
  }

  const lines = [];
  lines.push("I could not reach Gemini right now, so here is a fallback recommendation.");

  if (question) {
    lines.push(`You asked: ${question}`);
  }

  if (topMatches.length) {
    lines.push("");
    lines.push("Best matches:");
    topMatches.forEach((resource) => {
      lines.push(`- ${resource.name}${resource.campus ? ` (${resource.campus})` : ""}`);
    });
  }

  if (alternatives.length) {
    lines.push("");
    lines.push("Alternatives:");
    alternatives.forEach((resource) => {
      lines.push(`- ${resource.name}${resource.url ? ` - ${resource.url}` : ""}`);
    });
  }

  lines.push("");
  lines.push("Next step: confirm hours and eligibility with the office before you go.");

  return lines.join("\n");
}

function extractGeminiText(payload) {
  const candidates = payload?.candidates || [];
  const content = candidates[0]?.content;
  const parts = content?.parts || [];

  return parts
    .map((part) => part?.text || "")
    .join("")
    .trim();
}

router.post("/", async (req, res) => {
  try {
    const {
      question = "",
      profile = {},
      matchedResources = [],
      resourceCatalog = [],
    } = req.body || {};

    const trimmedQuestion = String(question).trim();
    if (!trimmedQuestion) {
      return res.status(400).json({ message: "question is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const normalizedMatchedResources = Array.isArray(matchedResources)
      ? matchedResources.map(normalizeResource).filter(Boolean)
      : [];
    const normalizedCatalog = Array.isArray(resourceCatalog)
      ? resourceCatalog.map(normalizeResource).filter(Boolean)
      : [];

    if (!apiKey) {
      return res.status(200).json({
        reply: buildFallbackReply({
          question: trimmedQuestion,
          matchedResources: normalizedMatchedResources,
          resourceCatalog: normalizedCatalog,
        }),
        mode: "fallback",
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: HUNTER_NAVIGATOR_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: JSON.stringify(
                    {
                      question: trimmedQuestion,
                      profile,
                      matchedResources: normalizedMatchedResources,
                      resourceCatalog: normalizedCatalog,
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({
        message: "Gemini request failed.",
        error: errorText,
        reply: buildFallbackReply({
          question: trimmedQuestion,
          matchedResources: normalizedMatchedResources,
          resourceCatalog: normalizedCatalog,
        }),
        mode: "fallback",
      });
    }

    const payload = await response.json();
    const reply = extractGeminiText(payload) || buildFallbackReply({
      question: trimmedQuestion,
      matchedResources: normalizedMatchedResources,
      resourceCatalog: normalizedCatalog,
    });

    return res.status(200).json({
      reply,
      mode: "gemini",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate chat response.",
      error: error.message,
      reply: "I hit a server issue while answering that. Try again in a moment.",
      mode: "error",
    });
  }
});

module.exports = router;
