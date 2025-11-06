import { fileURLToPath, URL } from "node:url";
import { debuglog } from "node:util";
import { createServer as createNetServer, Server } from "node:net";
import { env } from "node:process";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { stat, mkdir, copyFile } from "node:fs/promises";
import { spawn } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { hashElement } from "folder-hash";

const log = debuglog("test");

/** Where to find wash as an executable */
const TEST_WASH_CMD = env.TEST_WASH_CMD ?? `wash`;

/** Path to the src folder */
const SRC_FOLDER_PATH = fileURLToPath(
  new URL(env.WASM_PATH ?? "../src", import.meta.url),
);

/** Path to the dist folder */
const DIST_FOLDER_PATH = fileURLToPath(
  new URL(env.WASM_PATH ?? "../dist", import.meta.url),
);

/** Args for `setupE2E()` */
interface SetupE2EArgs {
  path?: string;
}

/** Returned by `setupE2E()` */
interface E2ETestSetup {
  serverURL: URL;
  [Symbol.dispose]: () => Promise<void> | void;
}

/**
 * Setup for an E2E test, starting a server that is serving
 * the MCP component provided
 * @param {SetupE2EArgs} args
 * @returns {Promise<E2ETestSetup>}
 */
export async function setupE2E(args: SetupE2EArgs): Promise<E2ETestSetup> {
  // wash dev will build the component itself, so we don't need to check for the wasm file

  // Generate a random port
  const randomPort = await getRandomPort();

  // Spawn wash dev
  const cmdArgs = [
    "dev",
    "--address",
    `127.0.0.1:${randomPort}`,
  ];
  log(`SPAWN: ${TEST_WASH_CMD} ${cmdArgs.join(" ")}`);
  const proc = spawn(TEST_WASH_CMD, cmdArgs, {
    detached: false,
    stdio: "pipe",
    shell: false,
  });

  // Capture stdout and stderr for error reporting
  let stdoutBuffer = "";
  let stderrBuffer = "";

  // Wait for the server to start
  await Promise.race([
    new Promise((resolve, reject) => {
      proc.stdout.on("data", (data: Buffer) => {
        const output = data.toString();
        stdoutBuffer += output;
        log(`(wash dev) STDOUT: ${output}`);
        if (output.includes("listening for HTTP requests") || output.includes("HTTP server starting")) {
          resolve(null);
        }
      });
      proc.stderr.on("data", (data: Buffer) => {
        const output = data.toString();
        stderrBuffer += output;
        log(`(wash dev) STDERR: ${output}`);
        if (output.includes("listening for HTTP requests") || output.includes("HTTP server starting")) {
          resolve(null);
        }
      });
      proc.on("error", (err) => {
        log(`(wash dev) ERROR: ${err.message}`);
        reject(new Error(`wash dev process error: ${err.message}`));
      });
      proc.on("exit", (code, signal) => {
        log(`(wash dev) EXITED with code: ${code}, signal: ${signal}`);
        if (code !== 0 && code !== null) {
          reject(new Error(`wash dev process exited with code: ${code}\n\nSTDOUT:\n${stdoutBuffer}\n\nSTDERR:\n${stderrBuffer}`));
        }
      });
    }),
    new Promise((_resolve, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `timed out waiting for spawned wash dev server listen\n\nSTDOUT:\n${stdoutBuffer}\n\nSTDERR:\n${stderrBuffer}`,
            ),
          ),
        1000 * 180,
      ),
    ),
  ]);

  const url = new URL(`http://localhost:${randomPort}`);
  if (args?.path) {
    url.pathname = args.path;
  }

  return {
    serverURL: url,
    [Symbol.dispose]: () => {
      if (proc.pid === undefined) {
        throw new Error("unexpectedly undefined PID");
      }
      proc.kill();
      log(`terminated wash dev process with PID [${proc.pid}]`);
    },
  };
}

// Utility function for getting a random port
export async function getRandomPort(): Promise<number> {
  return await new Promise((resolve) => {
    const server = createNetServer();
    server.listen(0, function (this: Server) {
      const addr = server.address();
      if (addr === null || typeof addr === "string") {
        throw new Error("address is unexpected format");
      }
      server.on("close", () => resolve(addr.port));
      server.close();
    });
  });
}

/** Options for `setupMCPClient()` */
interface SetupMCPClientArgs {
  url: URL;
}

/**
 * Set up an MCP client
 *
 * @param {object} args
 * @param {URL} args.url
 */
export async function setupMCPClient(args: SetupMCPClientArgs) {
  const { url } = args;

  let client: Client | undefined = undefined;
  client = new Client({
    name: "streamable-http-client",
    version: "1.0.0",
  });

  const transport = new StreamableHTTPClientTransport(url);
  await client.connect(transport as any);

  return { client };
}

/** Options for `ensureComponentBuild()` */
interface EnsureTestComponentBuildArgs {
  tmpDirBasePath?: string;
}

const TEST_COMPONENT_NAME = "component.wasm";

/**
 * Ensure the test component is built
 *
 * @param {EnsureTestComponentBuildArgs} args
 * @returns {Promise<{ componentPath: string}>}
 */
export async function ensureTestComponentBuild(
  args?: EnsureTestComponentBuildArgs,
): Promise<{ componentPath: string }> {
  // If an override was provided, use it
  if (env.TEST_COMPONENT_PATH) {
    return { componentPath: env.TEST_COMPONENT_PATH };
  }

  // Calculate the SHA of the src directory
  const { hash } = await hashElement(SRC_FOLDER_PATH);
  const dirName = `mcp-server-test-run-${encodeURIComponent(hash)}`;
  let tmpDirPath = args?.tmpDirBasePath ?? tmpdir();
  const expectedDirPath = resolve(join(tmpDirPath, dirName));
  await mkdir(expectedDirPath, { recursive: true });

  const componentPath = resolve(expectedDirPath, TEST_COMPONENT_NAME);

  // If the component already exists, we can exit early
  const componentExists = await stat(componentPath)
    .then((p) => p.isFile())
    .catch(() => false);
  if (componentExists) {
    log(`using existing component @ [${componentPath}]`);
    return {
      componentPath,
    };
  }

  // Run NPM build to build the component
  const proc = spawn("npm", ["run", "build"], {
    detached: false,
    stdio: "pipe",
    shell: false,
  });

  await new Promise((resolve) => {
    proc.stdout.on("data", (data: string) => {
      if (data.includes("Successfully written")) {
        resolve(null);
      }
    });
  });

  const builtComponentPath = join(DIST_FOLDER_PATH, TEST_COMPONENT_NAME);

  // If the component already exists, we can exit early
  const builtComponentExists = await stat(builtComponentPath)
    .then((p) => p.isFile())
    .catch(() => false);
  if (!builtComponentExists) {
    throw new Error(`failed to build test component @ [${builtComponentPath}]`);
  }

  // Copy over the built component to it's expected path
  await copyFile(builtComponentPath, componentPath);

  return { componentPath };
}
