import type { ApiKeyState } from "./mikeApi";

export type ModelProvider = "claude" | "gemini" | "openai" | "ollama";

export function getModelProvider(modelId: string): ModelProvider {
    if (modelId.startsWith("claude")) return "claude";
    if (modelId.startsWith("gemini")) return "gemini";
    if (modelId.startsWith("gpt")) return "openai";
    if (modelId === "ollama") return "ollama";
    // custom models – assume they are OpenAI compatible? Let's assume "openai"
    return "openai";
}

export function isModelAvailable(modelId: string, apiKeys?: ApiKeyState): boolean {
    // Custom models (ones not in DEFAULT_MODELS) are assumed available (user is responsible)
    const isCustomModel = ![
        "claude-opus-4-7",
        "claude-sonnet-4-6",
        "gemini-3.1-pro-preview",
        "gemini-3-flash-preview",
        "gpt-5.5",
        "gpt-5.4-mini",
        "ollama",
    ].includes(modelId);
    if (isCustomModel) return true;

    if (modelId === "ollama") {
        // For now, always assume Ollama is available.
        // Later you could add a fetch to http://localhost:11434/api/tags to check.
        return true;
    }

    const provider = getModelProvider(modelId);
    if (!apiKeys) return false;
    if (provider === "claude") return !!apiKeys.claude?.configured;
    if (provider === "gemini") return !!apiKeys.gemini?.configured;
    if (provider === "openai") return !!apiKeys.openai?.configured;
    return false;
}