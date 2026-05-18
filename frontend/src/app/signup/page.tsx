"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MarketingOSLogo } from "@/components/marketingos-logo";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/app/lib/mikeApi";

export default function SignupPage() {
    const router = useRouter();
    const { isAuthenticated, authLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [organisation, setOrganisation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated && !success) {
            router.replace("/assistant");
        }
    }, [authLoading, isAuthenticated, router, success]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                const trimmedName = name.trim();
                const trimmedOrg = organisation.trim();
                if (trimmedName || trimmedOrg) {
                    try {
                        await updateUserProfile({
                            ...(trimmedName && { displayName: trimmedName }),
                            ...(trimmedOrg && { organisation: trimmedOrg }),
                        });
                    } catch (profileError) {
                        console.error("[signup] failed to persist profile fields", profileError);
                    }
                }
            }
            setSuccess(true);
            setTimeout(() => {
                router.push("/assistant");
            }, 2000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred during signup");
        } finally {
            setLoading(false);
        }
    };

    // Success View
    if (success) {
        return (
            <div className="min-h-dvh bg-[#0F1426] flex flex-col items-center justify-center px-6">
                <div className="mb-12">
                    <MarketingOSLogo size={120} showText={false} />
                </div>
                <div className="w-full max-w-md bg-[#1F2937] border border-[#374151] rounded-2xl p-10 text-center shadow-xl">
                    <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-3">Account created!</h2>
                    <p className="text-gray-300 leading-relaxed">Redirecting you to the home page...</p>
                </div>
            </div>
        );
    }

    // Signup Form View
    return (
        <div className="min-h-dvh bg-[#0F1426] flex flex-col items-center justify-center px-6 py-10">
            <div className="mb-12">
                <MarketingOSLogo size={120} showText={false} />
            </div>
            <div className="w-full max-w-md">
                <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-serif text-white">Create Account</h2>
                        <div className="bg-gray-800 p-1 rounded-md flex text-xs font-medium">
                            <Link href="/login" className="px-3 py-1 text-gray-300 hover:text-white">
                                Log in
                            </Link>
                            <span className="px-3 py-1 bg-[#374151] rounded-sm shadow-sm text-white">
                                Sign up
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Name <span className="text-gray-500">(optional)</span>
                            </label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Organisation <span className="text-gray-500">(optional)</span>
                            </label>
                            <Input
                                type="text"
                                value={organisation}
                                onChange={(e) => setOrganisation(e.target.value)}
                                placeholder="Your organisation"
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password (min. 6 characters)"
                                required
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded border border-red-800">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                        >
                            {loading ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-xs text-gray-400">
                        By signing up, you agree to our Terms of Use and Privacy Policy
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 leading-relaxed px-2 mt-4">
                    marketingOS is currently a demo product. Please do not upload, submit, or store sensitive,
                    confidential, privileged, client, or personally identifiable documents.
                </p>
            </div>
        </div>
    );
}