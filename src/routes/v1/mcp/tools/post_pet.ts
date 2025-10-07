import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "body": z.object({
      "tags": z.array(
        z.object({
          "id": z.number().optional(),
          "name": z.string().optional(),
        }).optional(),
      ).optional(),
      "name": z.string().optional(),
      "status": z.string().optional().describe("pet status in the store"),
      "photoUrls": z.array(
        z.string().optional(),
      ).optional(),
      "category": z.object({
        "name": z.string().optional(),
        "id": z.number().optional(),
      }).optional(),
      "id": z.number().optional(),
    }).optional(),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "post_pet",
    "Add a new pet to the store.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/pet`,
          method: 'POST',
          headers: {
 "Content-Type": "application/json"?.toString() ?? "",
          },
          body: JSON.stringify(args["body"]),
        })
        .then((response: Response) => response.text());

        return {
          content: [
            {
              type: "text",
              text: response,
            },
          ],
        };
      } catch (error) {
        console.error(`Error executing post_pet:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing post_pet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
