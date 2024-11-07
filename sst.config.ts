/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-form",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const tursoUrl = new sst.Secret("TursoUrl", "");
    const tursoAuthToken = new sst.Secret("TursoAuthToken", "");

    const drizzle = new sst.Linkable("Drizzle", {
      properties: {
        url: tursoUrl,
        authToken: tursoAuthToken,
      },
    });

    const web = new sst.aws.StaticSite("Web", {
      path: "packages/web",
      build: {
        command: "bun run build",
        output: "dist",
      },
    });

    const api = new sst.aws.Function("Api", {
      link: [drizzle],
      handler: "packages/api/src/index.handler",
      url: true,
    });
  },
});
