# TrustSECO.js

This tool, as a part of the TrustSECO project, aims to enhance the security and transparency of your package installations. It assesses the trustworthiness of npm packages before installation, ensuring you only add reliable dependencies to your projects.

## About TrustSECO

[TrustSECO](https://github.com/SecureSECO/TrustSECO) is a comprehensive project dedicated to elevating the security and reliability of open-source dependencies. In the evolving world of development, where dependencies can number in the hundreds for a single project, TrustSECO ensures you're building on a secure foundation.


## Features
- Fetch and display the trust score of a package before installing.
- Get a detailed scan of your project's dependencies and their associated trust scores.
-  A tree view to visualize a library’s dependencies and their trust scores, providing a  hierarchical perspective.
- Provides trust score insights with links for detailed analysis.

## Prerequisites

Node.js and npm.
For specific package manager support (like Yarn or pnpm), ensure they are installed.

```bash
$ git clone https://github.com/angeltemelko/TrustSECOjs.git
$ cd TrustSECOjs
$ npm install
$ npm link
```

## Usage

To evaluate and install a package:
```bash
$ trustseco install <library>
```

To scan your package.json:
```bash
$ trustseco scan
```

To visualize dependencies and their trust scores
```bash
$ trustseco view-tree <library> [version]
```

To evaulate a package
```bash
$ trustseco info <library> [version]
```

To uninstall a package
```bash
$ trustseco uninstall <library>
```

## Flags

The scna command has 2 flags 
- --dependencies where you can scan the transitive dependencies of your installed thrid-party libraries
- --report generates a csv report of the initial scan

## Policy 
If you would like to add custom policies, you can do so by adding policy.{env}.json in your root project, and add a json with 2 properties:
- Allowed: array of allowed libraries.
- Blocked: array of blocked libraries.

This method use Permissive Approach,  If both blocked and allowed are empty, you can assume that there are no restrictions. This means the tool will function just like the regular npm, without blocking or alerting on any package.
If, allowed is empty, and blocked is populated, you can install any package except the blocked one, vice-versa, if the allowed has packages, it will allow only the libraries inside that array. Populating both allowed and blocked has no value.
## Contributing

Contributions to this tool are welcome! Whether it's bug fixes, feature requests, or new ideas, your input is valuable to us. Feel free to raise issues or PRs. Remember, it's a part of the larger TrustSECO initiative, and your contributions help improve the security of the open-source ecosystem.

## Disclaimer

This tool is provided for informational purposes only and integrates insights from trustSECO. It's important to note that I am neither the maintainer nor a contributor to trustSECO. While this tool aims to offer valuable insights, users are cautioned not to solely rely on its trust scores without additional verification. The trust score might occasionally be inaccurate due to potential errors or bugs. I assume no liability for any vulnerabilities or issues that may arise from packages installed based on this tool's recommendations. Always conduct your own due diligence before integrating any package into your projects.

## License

[View License](LICENSE.txt)
