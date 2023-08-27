import { execSync } from 'child_process';
import { displayPackageDetails } from '../utils/table';
import { getNpmPackageVersion } from '../utils/npm';
import { hyperlink } from '../utils/hyperlink';
import { fetchTrustScoreMock } from '../services/fetchData';
const readline = require('readline');

const THRESHOLD = 80;

async function install(library: string) {
  const version = getNpmPackageVersion(library);
  const trustScore = await fetchTrustScoreMock(library);

  await displayPackageDetails(library, version, trustScore);

  if (trustScore >= THRESHOLD) {
    execSync(`npm install ${library}`, { stdio: 'inherit' });
    return;
  }

  console.warn(
    `\u001b[33mWarning: The trust score for ${library}@${version} is low ${trustScore}/100. Check ${hyperlink(
      'http://google.com',
      'TrustSECO portal'
    )} for more details.\u001b[0m`
  );

  const userConfirmed = await askUserToContinue();

  if (!userConfirmed) {
    console.log('Installation aborted due to low trust score.');
    return;
  }

  execSync(`npm install ${library}`, { stdio: 'inherit' });
}

function askUserToContinue(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      'Do you still want to continue installing? (Y/N) ',
      (answer: string) => {
        rl.close();
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}

export default install;
