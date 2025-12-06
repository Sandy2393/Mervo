import { login, listJobs } from "../../packages/sdk-js/src";

describe("sdk-js", () => {
  it("login calls fetch with payload", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: "t", userId: "u" }),
    });
    const res = await login({ email: "a", password: "b" }, { fetchFn: mockFetch, baseUrl: "https://api" });
    expect(res.token).toBe("t");
    expect(mockFetch).toHaveBeenCalledWith("https://api/auth/login", expect.any(Object));
  });

  it("listJobs returns array", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: "1", title: "Job", location: "NY", dueAt: "today", status: "pending" }]),
    });
    const res = await listJobs({ token: "t", fetchFn: mockFetch, baseUrl: "https://api" });
    expect(res[0].id).toBe("1");
  });
});
