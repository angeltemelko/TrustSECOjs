import { execSync } from 'child_process';
import { displayPackageDetails } from '../utils/table';
import { getNpmPackageVersion } from '../utils/npm';
import { hyperlink } from '../utils/hyperlink';

const THRESHOLD = 80;

function install(library: string) {
    const version = getNpmPackageVersion(library);
    const trustScore = (Math.random() * 100) | 0; // Simulated until you have real data

    displayPackageDetails(library, version, trustScore);

    if (trustScore < THRESHOLD) {
        console.warn(
            `\u001b[33mWarning: The trust score for ${library}@${version} is low ${trustScore}/100. Check ${hyperlink(
                'http://google.com',
                'TrustSECO portal'
            )} for more details.\u001b[0m`
        );
    }

    execSync(`npm install ${library}`, { stdio: 'inherit' });
}

export default install;
