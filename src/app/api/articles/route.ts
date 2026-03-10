import { NextRequest, NextResponse } from "next/server";
import { supabase as anonClient, createAdminClient } from "@/lib/supabase";

function getClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }
  return anonClient;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);
  const supabase = getClient();

  // Debug endpoint to check DB status
  if (action === "debug") {
    const { count, error } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true });

    const { data: sample } = await supabase
      .from("articles")
      .select("title, category, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    return NextResponse.json({
      totalArticles: count,
      error: error?.message || null,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
      latestArticles: sample || [],
    });
  }

  if (action === "search") {
    const query = searchParams.get("q") || "";
    if (!query) {
      return NextResponse.json({ data: [] });
    }
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ data: [], error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  }

  if (action === "by-category") {
    const category = searchParams.get("category") || "";
    let query = supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ data: [], error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
