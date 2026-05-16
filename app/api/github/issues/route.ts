import { NextResponse } from "next/server";

const owner = "idsinas27";
const repo = "agent-dns";
const templatePath = ".github/ISSUE_TEMPLATE";

type GitHubContentItem = {
  download_url: string | null;
  name: string;
  type: string;
};

type IssueTemplate = {
  description: string;
  name: string;
  url: string;
};

function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.(md|ya?ml)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readYamlValue(content: string, key: string) {
  const match = content.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function parseTemplate(fileName: string, content: string) {
  const name =
    readYamlValue(content, "name") ||
    readYamlValue(content, "title") ||
    titleFromFileName(fileName);
  const description =
    readYamlValue(content, "description") || `Create a ${name.toLowerCase()} issue.`;

  return {
    description,
    name,
    url: `https://github.com/${owner}/${repo}/issues/new?template=${encodeURIComponent(
      fileName,
    )}`,
  };
}

export const runtime = "nodejs";

export async function GET() {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${templatePath}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: {
        revalidate: 300,
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Unable to load issue templates.",
        templates: [
          parseTemplate("question.md", "name: question"),
          parseTemplate("bug.md", "name: bug"),
          parseTemplate("enhancement.md", "name: enhancement"),
        ],
      },
      { status: 200 },
    );
  }

  const items = (await response.json()) as GitHubContentItem[];
  const templateFiles = items.filter(
    (item) =>
      item.type === "file" &&
      item.name !== "config.yml" &&
      /\.(md|ya?ml)$/i.test(item.name),
  );

  const templates = await Promise.all(
    templateFiles.map(async (item): Promise<IssueTemplate> => {
      if (!item.download_url) {
        return parseTemplate(item.name, "");
      }

      const templateResponse = await fetch(item.download_url, {
        next: {
          revalidate: 300,
        },
      });
      const content = await templateResponse.text().catch(() => "");

      return parseTemplate(item.name, content);
    }),
  );

  return NextResponse.json({ templates });
}
