import { createFileRoute } from "@tanstack/react-router";
import { api } from "~/lib/api";

export const Route = createFileRoute("/form/$formId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const response = await api.form[":formId"].$get({
      param: params,
    });

    const form = await response.json();

    return {
      form,
    };
  },
});

function RouteComponent() {
  const { form } = Route.useLoaderData();

  return <pre>{JSON.stringify(form, null, 2)}</pre>;
}
