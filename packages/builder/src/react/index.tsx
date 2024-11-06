export * from "./attributes";
export * from "./fields";

export function renderComponent(opts: {
  component: React.ComponentType<any>;
  props: Record<string, unknown>;
}) {
  const { component: Component, props } = opts;

  return <Component {...props} />;
}
