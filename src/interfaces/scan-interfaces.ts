export interface DependencyNode {
  name: string;
  version: string;
  trustScore: number | undefined;
  dependencies: Record<string, DependencyNode>;
}

export interface LowTrustLibrary {
  library: string;
  version: string;
  trustScore: number;
}

export interface ScanOptions {
  dependencies?: boolean;
  report?: boolean;
}

export const customHeaderMap = {
  'Package Name': 'library',
  Version: 'version',
  'Trust Score': 'trustScore',
};
