export interface TrustFact {
  type: string;
  value: string;
}

export const defaultPackage: Package = {
  platform: 'Github',
  owner: 'Fides',
  name: 'Portal',
  versions: ['v7.8.9', 'v4.5.6', 'v1.2.3'],
};

export interface Package {
  platform: string;
  owner: string;
  name: string;
  versions: string[];
}

export interface ApiTrustFact {
  jobID: number;
  version: string;
  fact: string;
  factData: string;
  account: { uid: string };
}

export interface PackageDetailsTransitiveDependencies {
  version: string;
  name: string;
  dependencies: Record<string, string>;
}

export interface DependencyTree {
  [key: string]: DependencyTree;
}

export type FetchFunction = (
  packageName: string,
  version?: string,
  depth?: number
) => Promise<DependencyTree>;
