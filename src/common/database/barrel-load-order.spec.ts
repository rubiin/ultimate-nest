// Regression: `audit.subscriber` imports `@entities`, whose classes extend `BaseEntity` from this
// barrel. If the barrel re-exports the subscriber before `base.entity`, loading the barrel first
// (as `node dist/main` does via `@common/guards`) evaluates the entities while `BaseEntity` is still
// undefined and boot dies with "Class extends value undefined".
describe("@common/database barrel", () => {
  it("can be the first module loaded without breaking the entity import cycle", async () => {
    vi.resetModules();

    const database = await import("@common/database");
    const entities = await import("@entities");

    expect(database.BaseEntity).toBeTypeOf("function");
    expect(Object.getPrototypeOf(entities.Category)).toBe(database.BaseEntity);
  });
});
