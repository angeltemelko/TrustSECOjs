import { fetchTrustScoreMock } from '../services/fetch-data';
import { getNpmPackageVersion } from '../utils/npm';
import { displayPackageDetails } from '../utils/table';

export async function info(packageName: string, version: string): Promise<void> {
  const resolvedVersion = version || getNpmPackageVersion(packageName);
  const trustScore = await fetchTrustScoreMock(packageName, resolvedVersion);
  await displayPackageDetails(packageName, resolvedVersion, trustScore);
}
