import * as fs from 'fs';
import { checkPolicies } from '../../src/utils/policy'; 

jest.mock('fs');

describe('checkPolicies', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if policy file does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    const result = await checkPolicies('trustseco', 'ploicy.development.json');
    
    expect(result).toBe(true);
  });

  it('should return false and log warning if package is blocked', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const packageName = 'trustseco';
    const policyFile = 'ploicy.development.json';
    const policies = {
      blocked: [packageName],
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(policies));
    
    const result = await checkPolicies(packageName, policyFile);
    
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`The package ${packageName} is blocked`));
    
    consoleErrorSpy.mockRestore();
  });

  it('should return false and log warning if package is not allowed', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const packageName = 'trustseco';
    const policyFile = 'ploicy.development.json';
    const policies = {
      allowed: ['secureseco'],
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(policies));
    
    const result = await checkPolicies(packageName, policyFile);
    
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`The package ${packageName} is not on the allowed list`));
    
    consoleErrorSpy.mockRestore();
  });

  it('should return true if package is allowed', async () => {
    const packageName = 'trustseco';
    const policyFile = 'ploicy.development.json';
    const policies = {
      allowed: [packageName],
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(policies));
    
    const result = await checkPolicies(packageName, policyFile);
    
    expect(result).toBe(true);
  });

});
