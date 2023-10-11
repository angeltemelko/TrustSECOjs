import { fetchTrustFacts, fetchTrustScore, fetchTrustScoreMock } from '../services/fetch-data';
import { getNpmPackageVersion } from '../utils/npm';
import { displayPackageDetails } from '../utils/table';
import * as semver from 'semver';
import ora from 'ora';

export async function info(
  packageName: string,
  version?: string
): Promise<void> {
  const spinner = ora('Loading').start();
  const resolvedVersion = version || getNpmPackageVersion(packageName);
  const cleanedVersion = semver.valid(semver.coerce(resolvedVersion)) || "";
  const [trustScore, trustFacts] = await Promise.all([
    fetchTrustScore(packageName, cleanedVersion),
    fetchTrustFacts(packageName, cleanedVersion)
  ]);
  spinner.stop();

  trustScore
    ? await displayPackageDetails(packageName, cleanedVersion, trustScore, trustFacts)
    : console.log('There was no trust score');
}
