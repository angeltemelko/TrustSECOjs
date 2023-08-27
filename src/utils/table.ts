import { fetchTrustFactsMock } from '../services/fetchData';

const Table = require('cli-table3');

export async function displayPackageDetails(
  name: string,
  version: string,
  trustScore: number
) {
  const trustFacts = await fetchTrustFactsMock(name, version);

  const mainTable = new Table({
    head: ['Name', 'Version', 'Trust Score'],
    colWidths: [20, 10, 15],
  });

  mainTable.push([name, version, `${trustScore}/100`]);

  console.log(mainTable.toString());

  if (trustFacts && trustFacts.length > 0) {
    const factsTable = new Table({
      head: ['Type', 'Value'],
      colWidths: [20, 40],
    });

    for (const fact of trustFacts) {
      factsTable.push([fact.type, fact.value]);
    }

    console.log('\nTrust Facts:');
    console.log(factsTable.toString());
  } else {
    console.log('\nNo Trust Facts available for this package/version.');
  }
}
