import { getBaseUrl } from "./constants";
import { validateAuth } from "./auth";

export interface HTTPClientParams {
    baseUrl?: string;
}

export interface CallParams {
    path: string;
    pathParams?: Record<string, string>;
    query?: Record<string, string>;
    method?: RequestInit['method'];
    headers?: Record<string, string>;
    body?: RequestInit['body'];
}

export class HTTPClient {
    private baseUrl: string | undefined;

    constructor(params: HTTPClientParams = {}) {
        this.baseUrl = params.baseUrl;
    }

    public async call(params: CallParams): Promise<Response> {
        await validateAuth(params);

        // Lazy load the base URL at runtime to avoid Wizer initialization issues
        const baseUrl = this.baseUrl || getBaseUrl();

        let path = params.path;
        for (const [key, value] of Object.entries(params.pathParams ?? {})) {
            path = path.replace(`{${key}}`, value);
        }
        console.assert(!path.includes('{'), `Not all path params were replaced in path: ${path}`);

        return fetch(`${baseUrl}${path}?${new URLSearchParams(params.query).toString()}`, {
            method: params.method,
            headers: params.headers,
            body: params.body,
        });
    }
}

export const httpClient = new HTTPClient();
