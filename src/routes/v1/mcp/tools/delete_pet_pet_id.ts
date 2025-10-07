import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "api_key": z.string().optional().describe(""),

    "petId": z.string().describe("Pet id to delete"),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "delete_pet_pet_id",
    "Delete a pet.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/pet/{petId}`,
          method: 'DELETE',
          pathParams: {
            "petId": args["petId"] ?? "",
          },
          headers: {
 "api_key": args["api_key"]?.toString() ?? "",
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
        console.error(`Error executing delete_pet_pet_id:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing delete_pet_pet_id: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
