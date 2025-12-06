const integration = process.env.INTEGRATION === "true";

(integration ? describe : describe.skip)("integration sample", () => {
  it("hits local endpoint", async () => {
    const res = await fetch("http://localhost:3000/health").catch(() => ({ status: 500 } as any));
    expect(res.status).toBeLessThan(500);
  });
});
