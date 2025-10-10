import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "petId": z.string().describe("ID of pet that needs to be updated"),

    "name": z.string().optional().describe("Name of pet that needs to be updated"),

    "status": z.string().optional().describe("Status of pet that needs to be updated"),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "post_pet_pet_id",
    "Updates a pet resource based on the form data.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/pet/{petId}`,
          method: 'POST',
          pathParams: {
            "petId": args["petId"] ?? "",
          },
          query: {
            "name": args["name"] ?? "",
            "status": args["status"] ?? "",
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
        console.error(`Error executing post_pet_pet_id:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing post_pet_pet_id: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
