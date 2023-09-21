import { fetchTrustScoreMock } from '../services/fetch-data';
import { hyperlink } from '../utils/hyperlink';
import { delay } from '../utils/delay';
import { startLoadingIndicator } from '../utils/loading-Indicator';
import { getDependenciesAndPackageJson } from '../utils/dependencies';
import { THRESHOLD } from '../constants/global-constants';
import { writeFileSync } from 'fs';
import { jsonToCsv } from '../utils/json2csv';
import { execSync } from 'child_process';
import { AsciiTree } from 'oo-ascii-tree';

interface DependencyNode {
  name: string;
  version: string;
  dependencies?: { [key: string]: DependencyNode };
}

interface LowTrustLibrary {
  library: string;
  version: string;
  trustScore: number;
}

interface ScanOptions {
  dependencies?: boolean;
  report?: boolean;
}

const customHeaderMap = {
  'Package Name': 'library',
  Version: 'version',
  'Trust Score': 'trustScore',
};

async function scan(options: ScanOptions) {
  const { packageJson } = getDependenciesAndPackageJson();

  const stopLoadingIndicator = startLoadingIndicator();

  if (options.dependencies) {
    const commandOutput = execSync('npm ls --all --json', { encoding: 'utf8' });

    const parsedOutput = JSON.parse(commandOutput);
    const rootDependency: DependencyNode = {
      name: parsedOutput.name,
      version: parsedOutput.version,
      dependencies: mapDependencies(parsedOutput.dependencies),
    };
    const treeWithScores = await getDependencyTreeWithScores(rootDependency);
    treeWithScores.printTree();
    stopLoadingIndicator();
    return;
  }

  const { dependencies } = getDependenciesAndPackageJson();

  if (!dependencies.length) {
    console.log('No dependencies found.');
    return;
  }

  let lowTrustLibraries: LowTrustLibrary[] = [];

  for (const library of dependencies) {
    const trustScore = await fetchTrustScoreMock(library);
    const version = packageJson.dependencies[library];

    if (trustScore < THRESHOLD) {
      lowTrustLibraries.push({ library, version, trustScore });
    }

    await delay(500);
  }

  stopLoadingIndicator();

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  if (lowTrustLibraries.length === 0)
    console.log('All your dependencies have acceptable trust scores.');

  console.warn(
    'The following libraries have trust scores below the acceptable threshold:'
  );
  for (let { library, version, trustScore } of lowTrustLibraries) {
    console.warn(
      `\u001b[33m${library}@${version} - TrustScore: ${trustScore}\u001b[0m`
    );
  }
  console.log(
    `For more information, visit \u001b[34m${hyperlink(
      'https://google.com',
      'TrustSECO-portal'
    )}\u001b[0m.`
  );

  if (options.report) {
    const csv = jsonToCsv(lowTrustLibraries, customHeaderMap);
    writeFileSync('trust_scores_report.csv', csv);
    console.log(
      '\n A report has been created in the root folder of this project named trust_scores_report.csv'
    );
  }
}

async function getDependencyTreeWithScores(
  root: DependencyNode
): Promise<AsciiTree> {
  const trustScore = await fetchTrustScoreMock(root.name);
  const rootNode = new AsciiTree(
    `${root.name}@${root.version} ` +
      (trustScore < THRESHOLD
        ? `\u001b[33mTrustScore:${trustScore}\u001b[0m`
        : `TrustScore:${trustScore}`)
  );

  if (root.dependencies) {
    for (const child of Object.values(root.dependencies)) {
      const childNode = await getDependencyTreeWithScores(child);
      rootNode.add(childNode);
    }
  }

  return rootNode;
}

function mapDependencies(
  deps: any
): { [key: string]: DependencyNode } | undefined {
  if (!deps) return undefined;

  let mappedDeps: { [key: string]: DependencyNode } = {};

  for (const [name, dep] of Object.entries(deps)) {
    mappedDeps[name] = {
      name: name,
      version: (dep as any).version,
      dependencies: mapDependencies((dep as any).dependencies),
    };
  }

  return mappedDeps;
}

export default scan;
