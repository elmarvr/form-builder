import { useStore } from "@tanstack/react-store";
import { AttributeValues, Builder, UnknownField } from "../core";

export function useBuilderFields<const TFields extends UnknownField[]>(
  builder: Builder<TFields>,
  components: {
    [K in TFields[number]["name"]]: FieldComponent<TFields[number]>;
  }
) {
  const fields = useStore(builder.store, (state) => state.fields);

  return fields.map((field) => {
    const component = components[field.type as TFields[number]["name"]];

    if (!component) {
      throw new Error(`Component for field ${field.type} not found`);
    }

    return {
      id: field.id,
      component,
      props: {
        fieldId: field.id,
        attributes: field.attributes,
      },
    };
  });
}

export interface FieldComponentProps<TField extends UnknownField> {
  fieldId: string;
  attributes: AttributeValues<TField["attributes"]>;
}

export interface FieldComponent<TField extends UnknownField> {
  (props: FieldComponentProps<TField>): React.ReactNode;
  _field: TField;
}

export function createFieldComponent<TField extends UnknownField>(
  field: TField,
  render: (props: FieldComponentProps<TField>) => React.ReactNode
) {
  const Component = render as FieldComponent<TField>;
  Component._field = field;

  return Component;
}
