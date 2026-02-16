import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // 1. Create an initial response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // 2. Update REQUEST cookies (Crucial for Server Components to see the session)
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));

                    // 3. recreate the response with the new request cookies
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });

                    // 4. Update RESPONSE cookies (so the browser saves them)
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 5. Check Auth User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/auth");
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/library") ||
        request.nextUrl.pathname.startsWith("/campaigns") ||
        request.nextUrl.pathname.startsWith("/phishing") ||
        request.nextUrl.pathname.startsWith("/reports") ||
        request.nextUrl.pathname.startsWith("/org") ||
        request.nextUrl.pathname.startsWith("/users") ||
        request.nextUrl.pathname === "/";

    // 6. Redirect Rule
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
