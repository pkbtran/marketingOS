import type { ApiKeyState } from "./mikeApi";

export type ModelProvider = "claude" | "gemini" | "openai" | "ollama";

export function getModelProvider(modelId: string): ModelProvider {
    if (modelId.startsWith("claude")) return "claude";
    if (modelId.startsWith("gemini")) return "gemini";
    if (modelId.startsWith("gpt")) return "openai";
    if (modelId === "ollama") return "ollama";
    // custom models – assume OpenAI compatible
    return "openai";
}

export function isModelAvailable(modelId: string, apiKeys?: ApiKeyState): boolean {
    // For demo, always return true – backend has its own API keys
    return true;
}

export function providerLabel(provider: ModelProvider): string {
    switch (provider) {
        case "claude": return "Anthropic (Claude)";
        case "gemini": return "Google (Gemini)";
        case "openai": return "OpenAI";
        case "ollama": return "Ollama";
        default: return provider;
    }
}