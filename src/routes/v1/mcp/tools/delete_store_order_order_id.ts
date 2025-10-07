import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "orderId": z.string().describe("ID of the order that needs to be deleted"),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "delete_store_order_order_id",
    "For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/store/order/{orderId}`,
          method: 'DELETE',
          pathParams: {
            "orderId": args["orderId"] ?? "",
          },
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
        console.error(`Error executing delete_store_order_order_id:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing delete_store_order_order_id: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
