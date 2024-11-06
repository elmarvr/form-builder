/// <reference path="./.sst/platform/config.d.ts" />

import { Linkable } from "./.sst/platform/src/components";

export default $config({
  app(input) {
    return {
      name: "form-builder",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const web = new sst.aws.StaticSite("Web", {
      path: "packages/web",
      build: {
        command: "bun run build",
        output: "dist",
      },
    });

    const d1 = new sst.cloudflare.D1("D1", {});

    const api = new sst.cloudflare.Worker("Api", {
      link: [d1],
      handler: "packages/api/src/index.ts",
      url: true,
    });

    const drizzle = new Linkable("Drizzle", {
      properties: {
        accountId: sst.cloudflare.DEFAULT_ACCOUNT_ID,
        token: process.env.CLOUDFLARE_API_TOKEN!,
        databaseId: d1.id,
      },
    });

    return {
      Db: d1.id,
      Api: api.url,
      Web: web.url,
    };
  },
});
