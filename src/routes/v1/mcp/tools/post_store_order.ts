import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "body": z.object({
      "petId": z.number().optional(),
      "status": z.string().optional().describe("Order Status"),
      "id": z.number().optional(),
      "shipDate": z.string().optional(),
      "quantity": z.number().optional(),
      "complete": z.boolean().optional(),
    }).optional(),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "post_store_order",
    "Place a new order in the store.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/store/order`,
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
        console.error(`Error executing post_store_order:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing post_store_order: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
