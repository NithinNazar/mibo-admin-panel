import { describe, it, expect, vi } from "vitest";

// Try importing the component
vi.mock("../../../services/clinicianService");
vi.mock("../../../services/centreService");
vi.mock("../../../services/staffService");
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Import Test", () => {
  it("should import without error", async () => {
    const module = await import("./CliniciansPage");
    expect(module).toBeDefined();
  });
});
