import * as fs from 'fs';

export async function checkPolicies(
  packageName: string,
  policyFile: string
): Promise<boolean> {
  if (fs.existsSync(policyFile)) {
    const policies = JSON.parse(fs.readFileSync(policyFile, 'utf8'));
    const isPackageBlocked = policies.blocked?.includes(packageName);
    const isPackageAllowed = policies.allowed?.includes(packageName);

    if (isPackageBlocked) {
      console.error(
        `\u001b[33mWarning: The package ${packageName} is blocked by your organization's policy.\u001b[0m`
      );
      return false;
    }

    if (policies.allowed?.length > 0) {
      if (isPackageAllowed) {
        return true;
      }
      console.error(
        `\u001b[33mWarning: The package ${packageName} is not on the allowed list.\u001b[0m`
      );
      return false;
    }
  }
  return true;
}
