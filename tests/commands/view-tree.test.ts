import ora from 'ora';
import { viewTree, fetchDependencyTree } from '../../src/commands/view-tree';
import { AsciiTree } from 'oo-ascii-tree';
import { formatTrustScoreMessage } from '../../src/utils/common';
import { THRESHOLD } from '../../src/constants/global-constants';

jest.mock('ora', () =>
  jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  }))
);

jest.mock('../../src/commands/view-tree', () => ({
  fetchDependencyTree: jest.fn(),
}));


describe('viewTree function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful package fetching and trust score retrieval', async () => {
    const packageName = 'trustseco';
    const version = '0.1.0';

    const mockAsciiTree = new AsciiTree(formatTrustScoreMessage(packageName, version, THRESHOLD));

    (fetchDependencyTree as jest.Mock).mockReturnValue(mockAsciiTree);


    await viewTree(packageName, version);

    expect(ora).toBeCalledWith('Transitive scan may take a while');
    expect(ora().start).toBeCalledTimes(1);
    expect(ora().stop).toBeCalledTimes(1);
    expect(fetchDependencyTree).toBeCalledWith(
      packageName,
      version
    );
  });

  it('should handle failed checks correctly', async () => {
    const packageName = 'trustseco';
    const version = '0.1.0';

    (fetchDependencyTree as jest.Mock).mockRejectedValue(new Error('Fetch Error'));

    await viewTree(packageName, version);

    expect(ora).toBeCalledWith('Transitive scan may take a while');
    expect(ora().start).toBeCalledTimes(1);
    expect(ora().stop).toBeCalledTimes(1);
    expect(fetchDependencyTree).toBeCalledWith(
      packageName,
      version
    );
  });
});
