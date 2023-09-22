export interface ParsedLibrary {
  packageName: string;
  version?: string;
}

export function hyperlink(url: string, text: string): string {
  return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
