import { fetchTrustScore, fetchTrustScoreMock } from '../services/fetch-data';
import { getNpmPackageVersion } from '../utils/npm';
import { displayPackageDetails } from '../utils/table';
import * as semver from 'semver';

export async function info(
  packageName: string,
  version: string
): Promise<void> {
  const resolvedVersion = version || getNpmPackageVersion(packageName);
  const cleanedVersion = semver.valid(semver.coerce(resolvedVersion)) || "";
  const trustScore = await fetchTrustScore(packageName, cleanedVersion);
  trustScore
    ? await displayPackageDetails(packageName, cleanedVersion, trustScore)
    : console.log('There was no trust score');
}
