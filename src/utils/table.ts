import { fetchTrustFactsMock } from '../services/fetch-data';

export async function displayPackageDetails(
  name: string,
  version: string,
  trustScore: number
) {
  const trustFacts = await fetchTrustFactsMock(name, version);

  // Main table
  console.log(
    padString('Name', 20) +
      '|' +
      padString('Version', 10) +
      '|' +
      padString('Trust Score', 15)
  );
  console.log(rowSeparator([20, 10, 15]));
  console.log(
    padString(name, 20) +
      '|' +
      padString(version, 10) +
      '|' +
      padString(`${trustScore}/100`, 15)
  );

  console.log('\n');

  if (trustFacts && trustFacts.length > 0) {
    console.log(padString('Type', 20) + '|' + padString('Value', 40));
    console.log(rowSeparator([20, 40]));

    for (const fact of trustFacts) {
      console.log(padString(fact.type, 20) + '|' + padString(fact.value, 40));
    }
  } else {
    console.log('\nNo Trust Facts available for this package/version.');
  }
}

function padString(str: string, length: number) {
  return str.padEnd(length);
}

function rowSeparator(columns: number[]) {
  return columns.map((col) => '-'.repeat(col)).join('+');
}
