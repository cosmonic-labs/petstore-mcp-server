import { McpServer as UpstreamMCPServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import * as post_pet from "./post_pet.js";
import * as put_pet from "./put_pet.js";
import * as get_pet_find_by_status from "./get_pet_find_by_status.js";
import * as get_pet_find_by_tags from "./get_pet_find_by_tags.js";
import * as get_pet_pet_id from "./get_pet_pet_id.js";
import * as post_pet_pet_id from "./post_pet_pet_id.js";
import * as delete_pet_pet_id from "./delete_pet_pet_id.js";
import * as post_pet_pet_id_upload_image from "./post_pet_pet_id_upload_image.js";
import * as get_store_inventory from "./get_store_inventory.js";
import * as post_store_order from "./post_store_order.js";
import * as get_store_order_order_id from "./get_store_order_order_id.js";
import * as delete_store_order_order_id from "./delete_store_order_order_id.js";
import * as post_user from "./post_user.js";
import * as post_user_create_with_list from "./post_user_create_with_list.js";
import * as get_user_login from "./get_user_login.js";
import * as get_user_logout from "./get_user_logout.js";
import * as get_user_username from "./get_user_username.js";
import * as put_user_username from "./put_user_username.js";
import * as delete_user_username from "./delete_user_username.js";

export function setupAllTools<S extends UpstreamMCPServer>(server: S) {
  post_pet.setupTool(server);
  put_pet.setupTool(server);
  get_pet_find_by_status.setupTool(server);
  get_pet_find_by_tags.setupTool(server);
  get_pet_pet_id.setupTool(server);
  post_pet_pet_id.setupTool(server);
  delete_pet_pet_id.setupTool(server);
  post_pet_pet_id_upload_image.setupTool(server);
  get_store_inventory.setupTool(server);
  post_store_order.setupTool(server);
  get_store_order_order_id.setupTool(server);
  delete_store_order_order_id.setupTool(server);
  post_user.setupTool(server);
  post_user_create_with_list.setupTool(server);
  get_user_login.setupTool(server);
  get_user_logout.setupTool(server);
  get_user_username.setupTool(server);
  put_user_username.setupTool(server);
  delete_user_username.setupTool(server);
}
