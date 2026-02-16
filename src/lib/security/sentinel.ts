import { NextRequest, NextResponse } from "next/server";

export class Sentinel {
    public static async analyze(request: NextRequest): Promise<NextResponse | null> {
        // Placeholder for Rate Limiting Logic (Redis/Upstash would be ideal here)
        const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
        console.log(`[SENTINEL] Analyzing request from IP: ${ip}`);

        // Placeholder for WAF Logic (Basic Pattern Matching)
        const url = request.nextUrl.pathname;
        const maliciousPatterns = [/\.php$/, /\.env$/, /\.git/];

        if (maliciousPatterns.some((pattern) => pattern.test(url))) {
            console.warn(`[SENTINEL] BLOCKED Malicious Request: ${url} from ${ip}`);
            return new NextResponse(JSON.stringify({ error: "Access Denied by Sentinel Agent" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        return null; // Traffic is clean
    }
}
