import { RemoteAssetRepository } from "./asset-repository";

jest.setTimeout(20000);

describe("RemoteAssetRepository", () => {
  it("should return default assets if no remote/local", async () => {
    const repo = new RemoteAssetRepository();
    const assets = await repo.getAssets();
    expect(Array.isArray(assets)).toBe(true);
    expect(assets.length).toBeGreaterThan(0);
  });

  it("should get asset by id", async () => {
    const repo = new RemoteAssetRepository();
    const assets = await repo.getAssets();
    const asset = await repo.getAssetById(assets[0].id);
    expect(asset).toBeDefined();
    expect(asset?.id).toBe(assets[0].id);
  });
}); 