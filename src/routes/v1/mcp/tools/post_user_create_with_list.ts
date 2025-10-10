import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "body": z.array(
      z.object({
        "phone": z.string().optional(),
        "email": z.string().optional(),
        "password": z.string().optional(),
        "lastName": z.string().optional(),
        "id": z.number().optional(),
        "username": z.string().optional(),
        "userStatus": z.number().optional().describe("User Status"),
        "firstName": z.string().optional(),
      }).optional(),
    ).optional(),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "post_user_create_with_list",
    "Creates list of users with given input array.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/user/createWithList`,
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
        console.error(`Error executing post_user_create_with_list:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing post_user_create_with_list: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
