"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MarketingOSLogo } from "@/components/marketingos-logo";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, authLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/assistant");
        }
    }, [authLoading, isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/assistant");
        } catch (error: any) {
            setError(error.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-[#0F1426] flex items-start justify-center px-6 pt-32 md:pt-40 pb-10 relative">
            <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2">
                <MarketingOSLogo size={64} showText={false} />
            </div>
            <div className="w-full max-w-md">
                <div className="bg-[#1F2937] border border-[#374151] rounded-2xl p-8 mb-4 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-left text-2xl font-serif text-white">
                            Log In
                        </h2>
                        <div className="bg-gray-800 p-1 rounded-md flex text-xs font-medium">
                            <span className="text-white px-3 py-1 bg-[#374151] rounded-sm shadow-sm">
                                Log in
                            </span>
                            <Link
                                href="/signup"
                                className="px-3 py-1 text-gray-300 hover:text-white"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
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
                            className="w-full mt-5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </Button>
                    </form>
                </div>
                <p className="text-center text-xs text-gray-400 leading-relaxed px-2">
                    marketingOS is currently a demo product. Please do not upload, submit, or store sensitive,
                    confidential, privileged, client, or personally identifiable documents.
                </p>
            </div>
        </div>
    );
}