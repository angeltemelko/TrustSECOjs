export const THRESHOLD = process.env.TRUST_THRESHOLD 
  ? parseInt(process.env.TRUST_THRESHOLD, 10) 
  : 80;

export const mainDescription = `
TrustSECO CLI Tool
--------------------------
The TrustSECO CLI tool offers a comprehensive approach to assessing the trustworthiness of npm packages. It integrates seamlessly with your npm install process and provides a quick scan of your project's dependencies to fetch their trust scores. 

Primary Features:
- **Install Wrapper**: TrustSECO wraps the npm install process to gauge the trustworthiness of a package before its installation.
- **Dependency Scan**: Get a detailed scan of your project's dependencies and their associated trust scores.
- **Detailed Reporting**: For a more granular understanding, export the scan results to a CSV report.
- **Dependency Visualization**: A tree view to visualize a library’s dependencies and their trust scores, providing a hierarchical perspective.
- **Quick Uninstall**: Quickly uninstall any library directly using the CLI.
- **Library Info**: Fetch detailed information about any specific library.

With TrustSECO, stay assured and maintain the security posture of your projects with confidence.`;

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

  NOTE: If you would like to add custom policies, you can do so by adding policy.{env}.json in your root project, and add a json with 2 properties:
  Allowed: array of allowed libraries.
  Blocked: array of blocked libraries.
  This method use Permissive Approach,  If both blocked and allowed are empty, you can assume that there are no restrictions. This means the tool will function just like the regular npm, without blocking or alerting on any package.
  If, allowed is empty, and blocked is populated, you can install any package except the blocked one, vice-versa, if the allowed has packages, it will allow only the libraries inside that array. Populating both allowed and blocked has no value.
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
