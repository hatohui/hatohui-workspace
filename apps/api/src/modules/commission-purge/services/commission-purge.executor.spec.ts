import { CommissionPurgeExecutor } from '@/modules/commission-purge/services/commission-purge.executor';

function build(overrides: Record<string, unknown> = {}) {
  const commission = {
    id: 'c1',
    status: 'COMPLETED',
    purgedAt: null,
    allowGalleryPost: true,
    artist: { id: 'artist' },
    detail: {
      optionKey: 'flat',
      addonKeys: ['bg'],
      commissionType: { tag: { name: 'bust' } },
    },
    progress: [
      { isFinal: true, images: ['url/final.png'], description: null },
      { isFinal: false, images: ['url/wip.png'], description: 'see url/x.png' },
    ],
    comments: [{ images: ['url/chat.png'], body: 'hi' }],
    ...overrides,
  };
  const db = {
    commission: {
      findUnique: jest.fn().mockResolvedValue(commission),
      update: jest.fn(),
    },
    asset: { update: jest.fn() },
    tag: {
      upsert: jest.fn(({ where }) => ({ id: `tag-${where.name}` })),
    },
    assetTag: { createMany: jest.fn() },
    comment: { deleteMany: jest.fn() },
    commissionProgress: { deleteMany: jest.fn() },
    commissionStatusHistory: { updateMany: jest.fn() },
    commissionDetail: { updateMany: jest.fn() },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const assets = { ensureForUrl: jest.fn().mockResolvedValue('asset-1') };
  const attachments = {
    queueDeletes: jest.fn().mockReturnValue('queue-op'),
    release: jest.fn(),
  };
  const executor = new CommissionPurgeExecutor(
    db as never,
    assets as never,
    attachments as never,
  );
  return { executor, db, assets, attachments };
}

describe('CommissionPurgeExecutor', () => {
  it('ignores commissions that are not completed or already purged', async () => {
    for (const override of [{ status: 'ONGOING' }, { purgedAt: new Date() }]) {
      const { executor, db } = build(override);
      await executor.execute('c1');
      expect(db.$transaction).not.toHaveBeenCalled();
    }
  });

  it('moves final images to the gallery with tags and keeps them out of the delete queue', async () => {
    const { executor, db, assets, attachments } = build();
    await executor.execute('c1');

    expect(assets.ensureForUrl).toHaveBeenCalledWith('url/final.png', {
      id: 'artist',
    });
    expect(db.asset.update).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
      data: { commissionId: 'c1' },
    });
    expect(
      db.tag.upsert.mock.calls.map(([arg]) => arg.where.name).sort(),
    ).toEqual(['bg', 'bust', 'flat']);
    expect(attachments.queueDeletes).toHaveBeenCalledWith(
      ['url/final.png', 'url/wip.png', 'url/chat.png'],
      [null, 'see url/x.png', 'hi'],
      ['url/final.png'],
    );
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(attachments.release).toHaveBeenCalled();
  });

  it('marks result images private when gallery posting was refused', async () => {
    const { executor, db } = build({ allowGalleryPost: false });
    await executor.execute('c1');
    expect(db.asset.update).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
      data: { commissionId: 'c1', isPrivate: true },
    });
  });
});
