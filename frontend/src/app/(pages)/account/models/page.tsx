"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, saveApiKey, type ApiKeyProvider } from "@/app/lib/mikeApi";
import { ModelToggle } from "@/app/components/assistant/ModelToggle";
import type { ModelOption } from "@/app/components/assistant/ModelToggle";

export default function ModelsPage() {
    const { user } = useAuth();
    const [tabularModel, setTabularModel] = useState("gemini-3-flash-preview");
    const [apiKeys, setApiKeys] = useState<any>(null);
    const [customModels, setCustomModels] = useState<ModelOption[]>([]);
    const [newModelId, setNewModelId] = useState("");
    const [newModelLabel, setNewModelLabel] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load custom models from localStorage (or later from backend)
    useEffect(() => {
        const stored = localStorage.getItem("marketingos_custom_models");
        if (stored) {
            try {
                setCustomModels(JSON.parse(stored));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        getUserProfile()
            .then((profile) => {
                setTabularModel(profile.tabularModel ?? "gemini-3-flash-preview");
                setApiKeys(profile.apiKeyStatus);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    const handleTabularModelChange = async (modelId: string) => {
        setTabularModel(modelId);
        setSaving(true);
        try {
            await updateUserProfile({ tabularModel: modelId });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleApiKeySave = async (provider: ApiKeyProvider, key: string | null) => {
        setSaving(true);
        try {
            const status = await saveApiKey(provider, key);
            setApiKeys(status);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addCustomModel = () => {
        if (!newModelId || !newModelLabel) return;
        const newModel: ModelOption = {
            id: newModelId,
            label: newModelLabel,
            group: "Custom",
        };
        const updated = [...customModels, newModel];
        setCustomModels(updated);
        localStorage.setItem("marketingos_custom_models", JSON.stringify(updated));
        setNewModelId("");
        setNewModelLabel("");
    };

    const removeCustomModel = (id: string) => {
        const updated = customModels.filter((m) => m.id !== id);
        setCustomModels(updated);
        localStorage.setItem("marketingos_custom_models", JSON.stringify(updated));
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-medium font-serif text-white mb-6">Model Preferences</h1>

            <div className="space-y-6">
                {/* Tabular Review Model */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-5">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tabular review model
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                        We recommend using a smaller model for tabular reviews to reduce token costs.
                    </p>
                    <ModelToggle
                        value={tabularModel}
                        onChange={handleTabularModelChange}
                        apiKeys={apiKeys}
                        customModels={customModels}
                    />
                    {saving && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
                </div>

                {/* API Keys */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-5">
                    <h2 className="text-lg font-medium text-white mb-3">API Keys</h2>
                    <p className="text-xs text-gray-400 mb-4">
                        You must provide your own API keys for the app to work, or rely on server .env keys.
                    </p>
                    {(["claude", "gemini", "openai"] as ApiKeyProvider[]).map((provider) => (
                        <div key={provider} className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                                {provider} API Key
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    placeholder={`Enter your ${provider} API key`}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-400"
                                    onBlur={(e) => handleApiKeySave(provider, e.target.value || null)}
                                />
                            </div>
                            {apiKeys?.[provider]?.configured && (
                                <p className="text-xs text-green-400 mt-1">
                                    {apiKeys[provider].source === "user"
                                        ? "Using your personal key"
                                        : "Using server .env key"}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Custom Models */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-5">
                    <h2 className="text-lg font-medium text-white mb-3">Custom Models</h2>
                    <p className="text-xs text-gray-400 mb-3">
                        Add your own models (e.g., local LLM endpoints, OpenAI‑compatible APIs). They will appear in the model dropdown.
                    </p>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Model ID (e.g., local-llama)"
                            value={newModelId}
                            onChange={(e) => setNewModelId(e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Display label"
                            value={newModelLabel}
                            onChange={(e) => setNewModelLabel(e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-400"
                        />
                        <button
                            onClick={addCustomModel}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm"
                        >
                            Add
                        </button>
                    </div>
                    {customModels.length === 0 ? (
                        <p className="text-sm text-gray-400">No custom models added yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {customModels.map((model) => (
                                <li key={model.id} className="flex items-center justify-between bg-gray-800 rounded-md px-3 py-2">
                                    <span className="text-sm text-white">{model.label} <span className="text-gray-400 text-xs">({model.id})</span></span>
                                    <button
                                        onClick={() => removeCustomModel(model.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}