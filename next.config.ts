import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';

function getDeploymentId(): string | undefined {
  if (process.env.NEXT_DEPLOYMENT_ID?.trim()) {
    return process.env.NEXT_DEPLOYMENT_ID.trim();
  }

  if (process.env.GIT_SHA?.trim()) {
    return process.env.GIT_SHA.trim();
  }

  try {
    return execSync('git rev-parse --short=12 HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  deploymentId: getDeploymentId(),
};

export default nextConfig;
