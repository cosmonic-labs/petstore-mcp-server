import { suite, test, expect, beforeAll } from "vitest";

import {
  ensureTestComponentBuild,
  setupE2E,
  setupMCPClient,
} from "../common.js";
import { MCP_BASE_PATH } from "../../src/routes/v1/mcp/index.js";

suite("MCP component", () => {
  beforeAll(async () => {
    // Ensure the component is built before running tests
    await ensureTestComponentBuild();
  });

  test("works", async () => {
    using testSetup = await setupE2E({
      path: MCP_BASE_PATH,
    });

    const { client } = await setupMCPClient({ url: testSetup.serverURL });
    expect(client).toBeTruthy();
  });
});
