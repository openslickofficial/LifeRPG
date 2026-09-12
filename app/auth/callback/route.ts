import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error || error_description) {
    const errorMsg = error_description || error || "Authentication failed";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorMsg)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if profile exists and has a username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || !profile.username) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Authorization code missing.")}`
  );
}
