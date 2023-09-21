export const THRESHOLD = 80;

export const helpTextUninstall = `
Usage:
  $ trustseco-cli uninstall <library>

Arguments:
  <library>   Name of the library to uninstall.

Details:
  This command provides a direct interface to uninstall a specified library via npm.
  `;
export const helpTextInstall = `
Usage:
  $ trustseco-cli install <library> [version]

Arguments:
  <library>   Name of the library you want to install. Use format: packageName or packageName@version.
  [version]   Optional. Version of the library you want to install. If not provided, the latest version is used.

Details:
  The install command intercepts the npm installation process to leverage a trust score. This allows you to make informed decisions on including a particular library in your project.
  `;
export const helpTextScan = `
Usage:
$ trustseco-cli scan [options]

Options:
-d, --dependencies   Scan transitive dependencies.
-r, --report         Export results to a CSV file.

Details:
Use this command to scan all dependencies in your project and retrieve their trust scores.
`;

export const helpTextInfo = `
Usage:
$ trustseco-cli info <library>

Arguments:
<library>   Name of the library for which you seek information.

Details:
Use this command to obtain detailed information about a specific library, including its trust score and other relevant metadata.
`;

export const helpTextViewTree = `
Usage:
  $ trustseco-cli view-tree <library> [version]

Arguments:
  <library>   Name of the library whose dependencies you want to visualize.
  [version]   Optional. Specific version of the library.

Details:
  This command presents a visual representation of a library’s dependencies, along with their respective trust scores.
`;
