import { query } from "@/db";
import { NextResponse } from "next/server";

type UserCountRow = {
  count: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query<UserCountRow>("SELECT COUNT(*)::text AS count FROM users");
    const gitAccounts = Number(rows[0]?.count ?? 0);

    return NextResponse.json({ gitAccounts });
  } catch (error) {
    console.error("[telemetry] failed to load registry metrics:", error);

    return NextResponse.json(
      { error: "Unable to load telemetry.", gitAccounts: null },
      { status: 200 },
    );
  }
}
