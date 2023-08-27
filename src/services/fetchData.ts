import {
  ApiTrustFact,
  TrustFact,
  defaultPackage,
} from '../interfaces/api-interfaces';

const baseUrlDlt = 'http://localhost:3000/api/dlt/';

export async function fetchTrustScore(
  packageName: string,
  version: string
): Promise<number | undefined> {
  const response = await fetch(`package/${packageName}/trust-score/${version}`);

  if (!response.ok) throw Error('Failed to fetch trust score');

  const data = await response.json();

  return typeof data === 'number' ? data : undefined;
}

export async function fetchTrustScoreMock(
  packageName: string
): Promise<number> {
  return await Promise.resolve((Math.random() * 100) | 0);
}

export async function fetchTrustFacts(
  packageName: string,
  version: string
): Promise<TrustFact[]> {
  const response = await fetch(`${baseUrlDlt}trust-facts/${packageName}`);

  if (!response.ok) {
    throw new Error('Failed to fetch trust facts');
  }

  const data: { facts: ApiTrustFact[] } = await response.json();

  if (!data.facts) {
    return [];
  }

  const versionFilter = (item: ApiTrustFact) => item.version === version;
  return data.facts
    .filter(versionFilter)
    .map((item: ApiTrustFact) => parseTrustFact(item));
}

export async function fetchTrustFactsMock(
  name: string,
  version: string
): Promise<TrustFact[]> {
  const trustFacts = [];
  const count = Math.floor(((name.length + 10) % 20) * Math.random());
  for (let i = 0; i < count; i += 1) {
    trustFacts[i] = {
      type: 'github stars',
      value: (i + 1).toString(),
    };
  }
  return trustFacts;
}

const parseTrustFact = (data: ApiTrustFact): TrustFact => ({
  ...defaultPackage,
  type: data.fact,
  value: data.factData,
});
