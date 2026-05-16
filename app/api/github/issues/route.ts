import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const owner = "idsinas27";
const repo = "agent-dns";

type IssuePayload = {
  body?: unknown;
  label?: unknown;
  title?: unknown;
};

const issueLabels = ["question", "bug", "enhancement"] as const;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function issueLabel(value: unknown): (typeof issueLabels)[number] {
  return issueLabels.includes(value as (typeof issueLabels)[number])
    ? (value as (typeof issueLabels)[number])
    : "question";
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.githubAccessToken) {
    return NextResponse.json(
      { error: "Sign in with GitHub again before submitting an issue." },
      { status: 401 },
    );
  }

  const payload = (await request.json().catch(() => ({}))) as IssuePayload;
  const title = stringValue(payload.title);
  const body = stringValue(payload.body);
  const label = issueLabel(payload.label);

  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 },
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.githubAccessToken}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ body, labels: [label], title }),
    },
  );

  const data = (await response.json().catch(() => null)) as
    | { html_url?: string; message?: string }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.message ??
          "GitHub rejected the issue request. Try signing in again.",
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    url: data?.html_url ?? `https://github.com/${owner}/${repo}/issues`,
  });
}
