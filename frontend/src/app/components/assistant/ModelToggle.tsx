"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";
import { isModelAvailable } from "@/app/lib/modelAvailability";
import type { ApiKeyState } from "@/app/lib/mikeApi";

export interface ModelOption {
    id: string;
    label: string;
    group: "Anthropic" | "Google" | "OpenAI" | "Local" | "Custom";
}

const DEFAULT_MODELS: ModelOption[] = [
    { id: "claude-opus-4-7", label: "Claude Opus 4.7", group: "Anthropic" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", group: "Anthropic" },
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", group: "Google" },
    { id: "gemini-3-flash-preview", label: "Gemini 3 Flash", group: "Google" },
    { id: "gpt-5.5", label: "GPT-5.5", group: "OpenAI" },
    { id: "gpt-5.4-mini", label: "GPT-5.4 Mini", group: "OpenAI" },
    { id: "ollama", label: "Ollama (Local)", group: "Local" },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";
export const ALLOWED_MODEL_IDS = DEFAULT_MODELS.map(m => m.id);

interface Props {
    value: string;
    onChange: (id: string) => void;
    apiKeys?: ApiKeyState;
    customModels?: ModelOption[];
}

export function ModelToggle({ value, onChange, apiKeys, customModels = [] }: Props) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allModels = [...DEFAULT_MODELS, ...customModels];
    const groups = allModels.reduce((acc, model) => {
        if (!acc[model.group]) acc[model.group] = [];
        acc[model.group].push(model);
        return acc;
    }, {} as Record<string, ModelOption[]>);

    const selectedModel = allModels.find((m) => m.id === value);

    const getAvailabilityClass = (modelId: string) => {
        const available = isModelAvailable(modelId, apiKeys);
        return available ? "" : "border-red-500";
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1 px-2 py-1 text-sm rounded-md border ${getAvailabilityClass(value)} bg-[#1F2937] text-gray-200 hover:bg-gray-700 transition-colors`}
            >
                {selectedModel?.label ?? value}
                <ChevronDown className="h-3 w-3" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-gray-700 bg-[#1F2937] shadow-lg overflow-hidden">
                    {Object.entries(groups).map(([group, models]) => (
                        <div key={group}>
                            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
                                {group}
                            </div>
                            {models.map((model) => {
                                const available = isModelAvailable(model.id, apiKeys);
                                return (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            onChange(model.id);
                                            setOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-700 transition-colors ${
                                            !available ? "opacity-50" : ""
                                        }`}
                                        disabled={!available}
                                    >
                                        <span className="text-gray-200">{model.label}</span>
                                        {value === model.id && <Check className="h-3.5 w-3.5 text-blue-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}