import { auth } from "@/auth";
import { NextResponse } from "next/server";

const owner = "idsinas27";
const repo = "agent-dns";

type GitHubIssue = {
  comments: number;
  created_at: string;
  html_url: string;
  labels: Array<{
    name: string;
  }>;
  number: number;
  pull_request?: unknown;
  state: string;
  title: string;
  updated_at: string;
  user: {
    id: number;
    login: string;
  } | null;
};

type SupportCase = {
  comments: number;
  createdAt: string;
  labels: string[];
  number: number;
  state: string;
  title: string;
  updatedAt: string;
  url: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const githubId = session?.user?.githubId;

  if (!githubId) {
    return NextResponse.json({ cases: [] });
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
      {
        headers,
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub issues request failed: ${response.status}`);
    }

    const issues = (await response.json()) as GitHubIssue[];
    const cases: SupportCase[] = issues
      .filter((issue) => !issue.pull_request)
      .filter((issue) => String(issue.user?.id) === githubId)
      .map((issue) => ({
        comments: issue.comments,
        createdAt: issue.created_at,
        labels: issue.labels.map((label) => label.name),
        number: issue.number,
        state: issue.state,
        title: issue.title,
        updatedAt: issue.updated_at,
        url: issue.html_url,
      }));

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("[support:cases] failed to load GitHub issues:", error);

    return NextResponse.json(
      { cases: [], error: "Unable to load support cases." },
      { status: 200 },
    );
  }
}
