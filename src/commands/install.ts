import { execSync } from 'child_process';
import { displayPackageDetails } from '../utils/table';
import { getNpmPackageVersion } from '../utils/npm';
import {
  fetchTrustFacts,
  fetchTrustScore,
  fetchTrustScoreMock,
} from '../services/fetch-data';
import { THRESHOLD } from '../constants/global-constants';
import * as readline from 'readline';
import { checkPolicies } from '../utils/policy';
import { hyperlink } from '../utils/common';
import * as semver from 'semver';
import ora from 'ora';

async function install(packageName: string, version?: string): Promise<void> {
  const env = process.env.NODE_ENV || 'development';
  const policyFile = `policy.${env}.json`;

  if (
    !(await checkPolicies(packageName, policyFile)) &&
    !(await askUserToContinue())
  ) {
    return;
  }

  const spinner = ora('Loading').start();

  const resolvedVersion = version || getNpmPackageVersion(packageName);
  if (resolvedVersion === 'unknown') {
    spinner.stop();
    console.warn('Package name not found in npm registy');
    return;
  }
  const cleanedVersion = semver.valid(semver.coerce(resolvedVersion)) || '';

  const [trustScore, trustFacts] = await Promise.all([
    fetchTrustScore(packageName, cleanedVersion),
    fetchTrustFacts(packageName, cleanedVersion),
  ]);

  spinner.stop();

  if (!trustScore) {
    console.warn(
      'Unable to retrive trust score, continue to install regularrly'
    );
    const userConfirmed = await askUserToContinue();
    if (userConfirmed)
      execSync(`npm install ${packageName}@${cleanedVersion}`, {
        stdio: 'inherit',
      });
    return;
  }

  await displayPackageDetails(
    packageName,
    cleanedVersion,
    trustScore,
    trustFacts
  );

  if (trustScore >= THRESHOLD) {
    execSync(`npm install ${packageName}@${cleanedVersion}`, {
      stdio: 'inherit',
    });
    return;
  }

  console.warn(
    `\u001b[33mWarning: The trust score for ${packageName}@${cleanedVersion} is low ${
      trustScore | 0
    }/100. Check ${hyperlink(
      `http://${process.env.PORTAL_URL || 'localhost:3000'}`,
      'TrustSECO portal'
    )} for more details.\u001b[0m`
  );

  const userConfirmed = await askUserToContinue();

  if (!userConfirmed) {
    console.log('Installation aborted due to low trust score.');
    return;
  }

  execSync(`npm install ${packageName}@${cleanedVersion}`, {
    stdio: 'inherit',
  });
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
