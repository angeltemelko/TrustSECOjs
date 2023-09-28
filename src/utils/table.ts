import { TrustFact } from '../interfaces/api-interfaces';
import { fetchTrustFacts, fetchTrustFactsMock } from '../services/fetch-data';
import ora from 'ora';

export async function displayPackageDetails(
  name: string,
  version: string,
  trustScore: number,
  trustFacts: TrustFact[]
) {
  
  console.log('Package Summary:');
  console.table([
    {
      Name: name,
      Version: version,
      TrustScore: `${trustScore | 0}/100`,
    },
  ]);

  const table: { [key: string]: any } = {};

  if (trustFacts && trustFacts.length > 0) {
    trustFacts.forEach((fact: TrustFact) => {
      if (fact.type !== 'cve_vulnerabilities') {
        table[fact.type] = fact.value;
      }
    });

    const cveVulnerabilities = trustFacts.find(fact => fact.type === 'cve_vulnerabilities');
   
    if (cveVulnerabilities) {
      console.log('\nVulnerabilities:');
      console.table(JSON.parse(cveVulnerabilities.value));
    }

    console.log('\nTrust Facts:');
    console.table(table);

  } else {
    console.log('\nNo Trust Facts available for this package/version.');
  }
}
