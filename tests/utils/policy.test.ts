import * as fs from 'fs';
import { checkPolicies } from '../../src/utils/policy'; 

jest.mock('fs');

describe('checkPolicies', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if policy file does not exist', async () => {
    // Arange
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // Act
    const result = await checkPolicies('trustseco', 'ploicy.development.json');
    
    // Assert
    expect(result).toBe(true);
  });

  it('should return false and log warning if package is blocked', async () => {
    // Arange
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const packageName = 'trustseco';
    const policyFile = 'ploicy.development.json';
    const policies = {
      blocked: [packageName],
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(policies));
    
    // Act
    const result = await checkPolicies(packageName, policyFile);
    
    // Assert
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`The package ${packageName} is blocked`));
    
    consoleErrorSpy.mockRestore();
  });

  it('should return false and log warning if package is not allowed', async () => {
    // Arange
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const packageName = 'trustseco';
    const policyFile = 'ploicy.development.json';
    const policies = {
      allowed: ['secureseco'],
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(policies));
    
    // Act
    const result = await checkPolicies(packageName, policyFile);
    

    // Assert
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`The package ${packageName} is not on the allowed list`));
    
    consoleErrorSpy.mockRestore();
  });

  it('should return true if package is allowed', async () => {
    // Arange
    const packageName = 'trustseco';
    const policyFile = 'ploicy.development.json';
    const policies = {
      allowed: [packageName],
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(policies));
    
    // Act
    const result = await checkPolicies(packageName, policyFile);
    
    // Assert
    expect(result).toBe(true);
  });

});
