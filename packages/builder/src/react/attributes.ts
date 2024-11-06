import { useStore } from "@tanstack/react-store";
import { Builder, UnknownAttribute, UnknownField } from "../core";
import { useEffect, useState } from "react";

export function useBuilderAttributes<const TFields extends UnknownField[]>(
  builder: Builder<TFields>,
  fieldId: string,
  components: {
    [K in TFields[number]["attributes"][number]["name"]]: AttributeComponent<
      Extract<TFields[number]["attributes"][number], { name: K }>
    >;
  }
) {
  const field = useStore(builder.store, (state) =>
    state.fields.find((f) => f.id === fieldId)
  );

  const errors = useStore(
    builder.store,
    (state) => state.attributeErrors[fieldId] ?? {}
  );

  const [state, setState] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setState(field?.attributes ?? {});
  }, [field]);

  const attributeDefs =
    builder._def.fields.find((f) => f.name === field?.type)?.attributes ?? [];

  return attributeDefs.map((attribute) => {
    const component = components[attribute.name as keyof typeof components];

    if (!component) {
      throw new Error(`Component for attribute ${attribute.name} not found`);
    }

    return {
      id: attribute.name,
      component,
      props: {
        fieldId,
        attribute,
        value: state[attribute.name] ?? "",
        onValueChange: (value: unknown) => {
          const changes = {
            [attribute.name]: value,
          };

          builder.validateAttributes(fieldId, changes);

          setState((state) => ({
            ...state,
            ...changes,
          }));
        },
        error: errors[attribute.name] ?? null,
      },
    };
  });
}

export function createAttributeComponent<TAttribute extends UnknownAttribute>(
  attribute: TAttribute,
  render: (props: AttributeComponentProps<TAttribute>) => React.ReactNode
) {
  const Component = render as AttributeComponent<TAttribute>;

  Component._attribute = attribute;

  return Component;
}

export interface AttributeComponent<TAttribute extends UnknownAttribute> {
  (props: AttributeComponentProps<TAttribute>): React.ReactNode;
  _attribute: TAttribute;
}

export interface AttributeComponentProps<TAttribute extends UnknownAttribute> {
  fieldId: string;
  attribute: TAttribute;
  value: ReturnType<TAttribute["validate"]>;
  onValueChange: (value: ReturnType<TAttribute["validate"]>) => void;
  error: Error | null;
}
