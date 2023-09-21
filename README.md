# TrustSECO.js

This tool, as a part of the TrustSECO project, aims to enhance the security and transparency of your package installations. It assesses the trustworthiness of npm packages before installation, ensuring you only add reliable dependencies to your projects.

## About TrustSECO

[TrustSECO](https://github.com/SecureSECO/TrustSECO) is a comprehensive project dedicated to elevating the security and reliability of open-source dependencies. In the evolving world of development, where dependencies can number in the hundreds for a single project, TrustSECO ensures you're building on a secure foundation.


## Features
- Fetch and display the trust score of a package before installing.
- Provides trust score insights with links for detailed analysis.
- Supports multiple package managers: npm, yarn, pnpm (and more coming soon).


## Prerequisites

Node.js and npm.
For specific package manager support (like Yarn or pnpm), ensure they are installed.

```bash
$ git clone [your-repo-link]
$ cd npm-trust-score-script
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

To uninstall a package
```bash
$ trustseco uninstall <library>
```

## Contributing

Contributions to this tool are welcome! Whether it's bug fixes, feature requests, or new ideas, your input is valuable to us. Feel free to raise issues or PRs. Remember, it's a part of the larger TrustSECO initiative, and your contributions help improve the security of the open-source ecosystem.
