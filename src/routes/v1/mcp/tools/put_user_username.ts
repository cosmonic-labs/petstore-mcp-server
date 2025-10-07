import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "username": z.string().describe("name that need to be deleted"),

    "body": z.object({
      "userStatus": z.number().optional().describe("User Status"),
      "username": z.string().optional(),
      "lastName": z.string().optional(),
      "phone": z.string().optional(),
      "password": z.string().optional(),
      "id": z.number().optional(),
      "firstName": z.string().optional(),
      "email": z.string().optional(),
    }).optional(),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "put_user_username",
    "This can only be done by the logged in user.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/user/{username}`,
          method: 'PUT',
          pathParams: {
            "username": args["username"] ?? "",
          },
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
        console.error(`Error executing put_user_username:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing put_user_username: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
