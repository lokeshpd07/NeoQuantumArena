import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "vercel",
  handlers: [
    {
      route: "/**",
      handler: "./server/index.ts",
    },
  ],
  publicAssets: [
    {
      dir: "dist/client",
      maxAge: 31536000,
    },
  ],
});
