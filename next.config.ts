import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "1";
const isGithubPagesExport = process.env.GITHUB_PAGES_EXPORT === "1";
const githubPagesBasePath = process.env.GITHUB_PAGES_BASE_PATH ?? "/german1000-design-audit";

const nextConfig: NextConfig = {
  output: isGithubPagesExport ? "export" : undefined,
  trailingSlash: isGithubPages ? true : undefined,
  basePath: isGithubPages ? githubPagesBasePath : undefined,
  assetPrefix: isGithubPages ? `${githubPagesBasePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
