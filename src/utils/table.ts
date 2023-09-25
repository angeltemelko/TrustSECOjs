import { TrustFact } from '../interfaces/api-interfaces';
import { fetchTrustFacts, fetchTrustFactsMock } from '../services/fetch-data';

export async function displayPackageDetails(
  name: string,
  version: string,
  trustScore: number
) {
  
  const trustFacts = await fetchTrustFactsMock(name, version);

  console.table([
    {
      Name: name,
      Version: version,
      TrustScore: `${trustScore | 0}/100`,
    },
  ]);

  console.log('\n');

  const table: { [key: string]: any } = {};

  if (trustFacts && trustFacts.length > 0) {
    trustFacts.forEach((fact: TrustFact) => {
      if (fact.type !== 'cve_vulnerabilities') {
        table[fact.type] = fact.value;
      }
    });

    const cveVulnerabilities = trustFacts.find(fact => fact.type === 'cve_vulnerabilities');
    if (cveVulnerabilities) {
      console.table(JSON.parse(cveVulnerabilities.value));
    }

    console.table(table);

  } else {
    console.log('\nNo Trust Facts available for this package/version.');
  }
}
