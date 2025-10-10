import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "body": z.object({
      "name": z.string().optional(),
      "id": z.number().optional(),
      "photoUrls": z.array(
        z.string().optional(),
      ).optional(),
      "tags": z.array(
        z.object({
          "id": z.number().optional(),
          "name": z.string().optional(),
        }).optional(),
      ).optional(),
      "category": z.object({
        "name": z.string().optional(),
        "id": z.number().optional(),
      }).optional(),
      "status": z.string().optional().describe("pet status in the store"),
    }).optional(),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "put_pet",
    "Update an existing pet by Id.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/pet`,
          method: 'PUT',
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
        console.error(`Error executing put_pet:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing put_pet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
