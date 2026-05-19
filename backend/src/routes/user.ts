import { Router } from "express";
import { createServerSupabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Helper to check API key status
function getApiKeyStatus(userApiKeys: Record<string, string> | null | undefined) {
    const providers = ["claude", "gemini", "openai"] as const;
    const status: Record<string, { configured: boolean; source: "user" | "env" | null }> = {};
    for (const p of providers) {
        const envKey = process.env[`${p.toUpperCase()}_API_KEY`];
        const userKey = userApiKeys?.[p];
        if (userKey) {
            status[p] = { configured: true, source: "user" };
        } else if (envKey) {
            status[p] = { configured: true, source: "env" };
        } else {
            status[p] = { configured: false, source: null };
        }
    }
    return status;
}

// GET /user/profile
router.get("/profile", requireAuth, async (req, res) => {
    const db = createServerSupabase();
    const userId = req.user.id;

    const { data: profile, error } = await db
        .from("user_profiles")
        .select("display_name, organisation, message_credits_used, credits_reset_date, tier, tabular_model, api_keys")
        .eq("user_id", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        return res.status(500).json({ error: "Failed to fetch profile" });
    }

    const creditsRemaining = 1000 - (profile?.message_credits_used ?? 0);
    const apiKeyStatus = getApiKeyStatus(profile?.api_keys);

    res.json({
        displayName: profile?.display_name ?? null,
        organisation: profile?.organisation ?? null,
        messageCreditsUsed: profile?.message_credits_used ?? 0,
        creditsResetDate: profile?.credits_reset_date ?? null,
        creditsRemaining: creditsRemaining < 0 ? 0 : creditsRemaining,
        tier: profile?.tier ?? "Free",
        tabularModel: profile?.tabular_model ?? "gemini-3-flash-preview",
        apiKeyStatus,
    });
});

// PATCH /user/profile
const updateProfileSchema = z.object({
    display_name: z.string().nullable().optional(),
    organisation: z.string().nullable().optional(),
    tabularModel: z.string().optional(),
    claudeApiKey: z.string().nullable().optional(),
    geminiApiKey: z.string().nullable().optional(),
    openaiApiKey: z.string().nullable().optional(),
});

router.patch("/profile", requireAuth, async (req, res) => {
    const db = createServerSupabase();
    const userId = req.user.id;
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { display_name, organisation, tabularModel, claudeApiKey, geminiApiKey, openaiApiKey } = parsed.data;

    // First get existing api_keys
    const { data: existing } = await db
        .from("user_profiles")
        .select("api_keys")
        .eq("user_id", userId)
        .single();

    const apiKeys = { ...(existing?.api_keys || {}) };
    if (claudeApiKey !== undefined) apiKeys.claude = claudeApiKey || undefined;
    if (geminiApiKey !== undefined) apiKeys.gemini = geminiApiKey || undefined;
    if (openaiApiKey !== undefined) apiKeys.openai = openaiApiKey || undefined;

    const updates: any = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (organisation !== undefined) updates.organisation = organisation;
    if (tabularModel !== undefined) updates.tabular_model = tabularModel;
    updates.api_keys = apiKeys;

    const { data: profile, error } = await db
        .from("user_profiles")
        .upsert({ user_id: userId, ...updates })
        .select("display_name, organisation, message_credits_used, credits_reset_date, tier, tabular_model, api_keys")
        .single();

    if (error) {
        console.error("Failed to update profile:", error);
        return res.status(500).json({ error: "Failed to update profile" });
    }

    const creditsRemaining = 1000 - (profile.message_credits_used ?? 0);
    const apiKeyStatus = getApiKeyStatus(profile.api_keys);

    res.json({
        displayName: profile.display_name ?? null,
        organisation: profile.organisation ?? null,
        messageCreditsUsed: profile.message_credits_used ?? 0,
        creditsResetDate: profile.credits_reset_date ?? null,
        creditsRemaining: creditsRemaining < 0 ? 0 : creditsRemaining,
        tier: profile.tier ?? "Free",
        tabularModel: profile.tabular_model ?? "gemini-3-flash-preview",
        apiKeyStatus,
    });
});

// DELETE /user/account
router.delete("/account", requireAuth, async (req, res) => {
    const db = createServerSupabase();
    const userId = req.user.id;

    const { error } = await db.auth.admin.deleteUser(userId);
    if (error) {
        console.error("Failed to delete user:", error);
        return res.status(500).json({ error: "Failed to delete account" });
    }
    res.status(204).send();
});

export default router;