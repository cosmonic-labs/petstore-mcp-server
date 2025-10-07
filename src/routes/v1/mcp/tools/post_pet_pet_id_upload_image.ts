import z from "zod";
import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { httpClient } from "../../../../http_client.js";
export function setupTool<S extends UpstreamMCPServer>(server: S) {
  const params = {
    "petId": z.string().describe("ID of pet to update"),

    "additionalMetadata": z.string().optional().describe("Additional Metadata"),

  };
  type ParamsType = z.infer<z.ZodObject<typeof params>>;
  server.tool(
    "post_pet_pet_id_upload_image",
    "Upload image of the pet.",
    params,
    async (args: ParamsType): Promise<CallToolResult> => {
      try {
        const response = await httpClient.call({
          path: `/pet/{petId}/uploadImage`,
          method: 'POST',
          pathParams: {
            "petId": args["petId"] ?? "",
          },
          query: {
            "additionalMetadata": args["additionalMetadata"] ?? "",
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
        console.error(`Error executing post_pet_pet_id_upload_image:`, error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing post_pet_pet_id_upload_image: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
