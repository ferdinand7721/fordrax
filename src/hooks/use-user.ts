"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface ExtendedUser {
    id: string;
    email: string | undefined;
    full_name: string | null;
    avatar_url: string | null;
}

export function useUser() {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", authUser.id)
                        .single();

                    setUser({
                        id: authUser.id,
                        email: authUser.email,
                        full_name: profile?.full_name ?? null,
                        avatar_url: profile?.avatar_url ?? null,
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        }

        getUser();
    }, []);

    return { user, loading };
}
