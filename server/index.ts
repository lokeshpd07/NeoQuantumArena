import { eventHandler } from "h3";
import server from "../dist/server/server.js";

export default eventHandler(async (event) => {
  const anyEvent = event as any;
  const req =
    anyEvent.request instanceof Request
      ? anyEvent.request
      : anyEvent.req instanceof Request
      ? anyEvent.req
      : new Request(anyEvent.url || `https://localhost${anyEvent.path || "/"}`, {
          method: anyEvent.method || "GET",
          headers: anyEvent.headers,
        });

  return await server.fetch(req, {}, {});
});
