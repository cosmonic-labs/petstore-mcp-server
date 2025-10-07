import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "body": z.object({
      "firstName": z.string().optional(),
      "password": z.string().optional(),
      "username": z.string().optional(),
      "userStatus": z.number().optional().describe("User Status"),
      "id": z.number().optional(),
      "lastName": z.string().optional(),
      "phone": z.string().optional(),
      "email": z.string().optional(),
    }).optional(),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "post_user",
    "This can only be done by the logged in user.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/user`,
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
        console.error(`Error executing post_user:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing post_user: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
