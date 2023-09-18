import { fetchTrustScoreMock } from '../services/fetch-data';
import { hyperlink } from '../utils/hyperlink';
import { delay } from '../utils/delay';
import { startLoadingIndicator } from '../utils/loading-Indicator';
import { getDependenciesAndPackageJson } from '../utils/dependencies';
import { THRESHOLD } from '../constants/global-constants';
import { writeFileSync } from 'fs';
import { jsonToCsv } from '../utils/json2csv';

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
  'Version': 'version',
  'Trust Score': 'trustScore',
};

async function scan(options: ScanOptions) {
  const { dependencies, packageJson } = getDependenciesAndPackageJson();
  if (!dependencies.length) {
    console.log('No dependencies found.');
    return;
  }

  const stopLoadingIndicator = startLoadingIndicator();

  let lowTrustLibraries: LowTrustLibrary[] = [];

  for (const library of dependencies) {
    const trustScore = await fetchTrustScoreMock(library);
    const version = packageJson.dependencies[library];

    if (trustScore < THRESHOLD) {
      lowTrustLibraries.push({ library, version, trustScore });
    }

    await delay(1000);
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

export default scan;
