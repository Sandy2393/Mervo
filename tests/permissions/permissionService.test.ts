import { describe, it, expect } from "vitest";
import { permissionService } from "../../server/permissions/permissionService";

describe("permissionService", () => {
  it("allows owners to perform all actions", () => {
    permissionService.addCompanyUser("user-1", "co-1", "owner");
    expect(permissionService.canPerform("user-1", "co-1", "settings.edit")).toBe(true);
    expect(permissionService.canPerform("user-1", "co-1", "retention.execute")).toBe(true);
  });

  it("blocks unauthorized roles", () => {
    permissionService.addCompanyUser("user-2", "co-1", "viewer");
    expect(() => permissionService.canPerform("user-2", "co-1", "settings.edit")).toThrowError();
  });

  it("throws when user missing from company", () => {
    expect(() => permissionService.canPerform("ghost", "co-9", "settings.view")).toThrowError();
  });
});
