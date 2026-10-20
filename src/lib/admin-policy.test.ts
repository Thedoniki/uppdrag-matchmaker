import { expect, it } from "vitest";
import { canManageAssignments } from "./admin-policy";
it("allows administrators to manage assignments", () => expect(canManageAssignments(["admin"])).toBe(true));
it("denies ordinary users", () => expect(canManageAssignments(["user"])).toBe(false));
it("denies visitors", () => expect(canManageAssignments([])).toBe(false));