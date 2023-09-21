import fs from 'fs';
import path from 'path';

interface Policy {
  allowedPackages?: string[];
  blockedPackages?: string[];
  minTrustScore?: number;
}

function readPolicy(): Policy {
  try {
    const policyPath = path.join(process.cwd(), '.cli-policy.json');
    const raw = fs.readFileSync(policyPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function isPackageAllowed(policy: Policy, packageName: string): boolean {
  if (policy.blockedPackages?.includes(packageName)) {
    console.warn(`\u001b[33mWarning: The package ${packageName} is blocked by policy.\u001b[0m`);
    return false;
  }
  
  if (policy.allowedPackages && !policy.allowedPackages.includes(packageName)) {
    console.warn(`\u001b[33mWarning: The package ${packageName} is not on the allowed list.\u001b[0m`);
    return false;
  }

  return true;
}