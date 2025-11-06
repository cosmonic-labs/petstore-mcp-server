import * as configStore from "wasi:config/store@0.2.0-rc.1";

// Lazy load the base URL from wasi:config/store to avoid calling during Wizer initialization
// You can set this value using the config store in your WASI runtime with key "SERVICE_URL"
let _baseUrl: string | null = null;

export function getBaseUrl(): string {
  if (_baseUrl === null) {
    const configBaseUrl = configStore.get("SERVICE_URL");
    _baseUrl = configBaseUrl || "https://petstore3.swagger.io/api/v3";
  }
  return _baseUrl;
}
