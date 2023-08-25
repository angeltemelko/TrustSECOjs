const Table = require('cli-table3');

function displayPackageDetails(name: string, version: string, trustScore: number) {
    const table = new Table({
        head: ['Name', 'Version', 'Trust Score'],
        colWidths: [20, 10, 15]
    });

    table.push([name, version, `${trustScore}/100`]);

    console.log(table.toString());
}

export { displayPackageDetails };
