import { THRESHOLD } from '../constants/global-constants';

export interface ParsedLibrary {
  packageName: string;
  version?: string;
}

export function hyperlink(url: string, text: string): string {
  return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}

export function parseLibrary(library: string): ParsedLibrary {
  const regexPattern = /^(?:@([^/]+)\/)?([^@]+)(?:@(.*))?$/;
  const match = library.match(regexPattern);

  if (!match) {
    throw new Error('Invalid library format.');
  }

  const scope = match[1];
  const packageName = scope ? `@${scope}/${match[2]}` : match[2];
  const version = match[3] || undefined;

  return {
    packageName,
    version,
  };
}

export function formatTrustScoreMessage(
  packageName: string,
  version: string,
  trustScore: number | undefined
): string {
  if (trustScore === undefined)
    return `${packageName}@${version} TrustScore:undefined`;
  return trustScore < THRESHOLD
    ? `${packageName}@${version} \u001b[33mTrustScore:${trustScore}\u001b[0m`
    : `${packageName}@${version} TrustScore:${trustScore}`;
}


export function getPackageId(packageName: string, version: string): string {
  return `${packageName}@${version}`;
}