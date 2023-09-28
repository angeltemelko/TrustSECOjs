import { fetchTrustScore, fetchTrustScoreMock } from '../services/fetch-data';
import { getDependenciesAndPackageJson } from '../utils/dependencies';
import { THRESHOLD } from '../constants/global-constants';
import { writeFileSync } from 'fs';
import { jsonToCsv } from '../utils/json2csv';
import { execSync } from 'child_process';
import { hyperlink } from '../utils/common';
import {
  DependencyNode,
  LowTrustLibrary,
  ScanOptions,
  customHeaderMap,
} from '../interfaces/scan-interfaces';
import * as semver from 'semver';
import { AsciiTree } from 'oo-ascii-tree';
import ora from 'ora';

async function scan(options: ScanOptions): Promise<void> {
  const { packageJson, dependencies } = getDependenciesAndPackageJson();

  const spinner = ora('Scan may take a while').start();

  if (options.dependencies) {
    const commandOutput = execSync('npm ls --omit=dev --all --json', { encoding: 'utf8' });

    const parsedOutput = JSON.parse(commandOutput);
    const rootDependency: DependencyNode = {
      name: parsedOutput.name,
      version: parsedOutput.version,
      dependencies: mapDependencies(parsedOutput.dependencies),
    };
    const treeWithScores = await getDependencyTreeWithScores(rootDependency);
    spinner.stop();
    treeWithScores.printTree();
    return;
  }

  if (Object.keys(dependencies).length === 0) {
    console.log('No dependencies found.');
    spinner.stop();
    return;
  }

  let lowTrustLibraries: LowTrustLibrary[] = [];

  for (const library in dependencies) {
    const cleanVersion = semver.valid(semver.coerce(dependencies[library]));
    const trustScore = await fetchTrustScoreMock(library, cleanVersion ?? '');
    const version = packageJson.dependencies[library];

    if (trustScore  && trustScore < THRESHOLD ) {
      lowTrustLibraries.push({ library, version, trustScore });
    }
  }

  spinner.stop();

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
      'http://localhost:3000',
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
