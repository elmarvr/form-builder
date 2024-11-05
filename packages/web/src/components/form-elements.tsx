import { useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { createContext } from "react";
import { memo } from "react";
import { useContext } from "react";

export function createAttribute<const TName extends string, TValue>(
  config: AttributeConfig<TName, TValue>
) {
  return config;
}

export function createField<
  TName extends string,
  const TAttributes extends AnyAttributeConfig[],
  TValue,
>(config: FieldConfig<TName, TAttributes, TValue>) {
  return config;
}

export function createConfig<const TFields extends AnyFieldConfig[]>(config: {
  fields: TFields;
}) {
  return config;
}

interface Builder<TFields extends AnyFieldConfig[]> {
  append: <TName extends TFields[number]["name"]>(field: {
    name: TName;
    attributes?: Partial<
      AttributeValues<EntityByName<TFields, TName>["attributes"]>
    >;
  }) => void;
  remove: (id: string) => void;
  update: <TName extends string>(
    id: string,
    field: {
      name: TName;
      attributes?: Partial<
        AttributeValues<EntityByName<TFields, TName>["attributes"]>
      >;
      value: ValidatorOutput<EntityByName<TFields, TName>>;
    }
  ) => void;
  schema: { root: Field[] };
  options: { fields: TFields };
}

export function useBuilder<const TFields extends AnyFieldConfig[]>(opts: {
  fields: TFields;
}) {
  const [fields, setFields] = useState<Field[]>([]);

  function append<TName extends TFields[number]["name"]>(field: {
    name: TName;
    attributes?: Partial<
      AttributeValues<EntityByName<TFields, TName>["attributes"]>
    >;
  }) {
    setFields((fields) => {
      return [
        ...fields,
        {
          id: createId(),
          attributes: {},
          value: undefined,
          ...field,
        },
      ];
    });
  }

  function remove(id: string) {
    setFields((fields) => {
      return fields.filter((field) => field.id !== id);
    });
  }

  function update<TName extends string>(
    id: string,
    field: {
      name: TName;
      attributes?: Partial<
        AttributeValues<EntityByName<TFields, TName>["attributes"]>
      >;
      value: ValidatorOutput<EntityByName<TFields, TName>>;
    }
  ) {
    setFields((fields) => {
      const _fields = [...fields];
      const index = _fields.findIndex((field) => field.id === id);

      if (index === -1) {
        return fields;
      }

      _fields[index] = {
        ..._fields[index]!,
        ...field,
      };

      return _fields;
    });
  }

  return {
    append,
    remove,
    update,

    schema: {
      root: fields,
    },
    options: opts,
  };
}

const FormBuilderContext = createContext<{
  builder: Builder<any>;
  components: FieldComponent<any>[];
  wrap?: (props: { children: React.ReactNode; id: string }) => JSX.Element;
} | null>(null);

function useBuilderContext() {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error("useBuilderContext must be used within a BuilderContext");
  }

  return context;
}

type FormBuilderComponents<T> = T extends [
  infer TField extends AnyFieldConfig,
  ...infer TRest,
]
  ? [FieldComponent<TField>, ...FormBuilderComponents<TRest>]
  : T;

export function BuilderFields<const TFields extends AnyFieldConfig[]>({
  builder,
  components,
  wrap,
}: {
  builder: Builder<TFields>;
  components: FormBuilderComponents<TFields>;
  wrap?: (props: { children: React.ReactNode; id: string }) => JSX.Element;
}) {
  const render = wrap
    ? wrap
    : (props: { children: React.ReactNode }) => props.children;

  return (
    <FormBuilderContext.Provider
      value={{
        builder,
        components: components as FieldComponent<any>[],
      }}
    >
      {builder.schema.root.map((field) => {
        return render({
          id: field.id,
          children: <BuilderField key={field.id} id={field.id} />,
        });
      })}
    </FormBuilderContext.Provider>
  );
}

type FormBuilderAttributesComponents<T> =
  ListAttributes<T> extends [
    infer TAttribute extends AnyAttributeConfig,
    ...infer TRest,
  ]
    ? [
        AttributeComponent<TAttribute>,
        ...FormBuilderAttributesComponents<TRest>,
      ]
    : T;

type ListAttributes<T> = T extends [
  infer TField extends AnyFieldConfig,
  ...infer TRest,
]
  ? [...TField["attributes"], ...ListAttributes<TRest>]
  : T;

export function BuilderAttributes<const TFields extends AnyFieldConfig[]>({
  builder,
  fieldId,
  components,
}: {
  builder: Builder<TFields>;
  fieldId: string;
  components: FormBuilderAttributesComponents<TFields>;
}) {
  const field = builder.schema.root.find((field) => field.id === fieldId);
  const { attributes } = builder.options.fields.find(
    (field) => field.name === field?.name
  )!;

  return attributes.map((attribute) => {
    const Component = components.find(
      (component) => component[AttributeSymbol] === attribute.name
    )!;

    return (
      <Component
        key={attribute.name}
        value={field?.attributes[attribute.name]}
        onValueChange={(value) => {
          builder.update(fieldId, {
            type: field!.name,
            attributes: {
              ...field!.attributes,
              [attribute.name]: value,
            },
          });
        }}
      />
    );
  });
}

export const BuilderField = ({ id }: { id: string }) => {
  const { builder, components } = useBuilderContext();
  const field = builder.schema.root.find((field) => field.id === id);

  const Component = components.find(
    (component) => component[FieldSymbol] === field?.name
  )!;

  return (
    <Component
      id={id}
      attributes={field?.attributes ?? {}}
      value={field?.value}
      onValueChange={(value) => {
        builder.update(id, { name: field!.name, value });
      }}
    />
  );
};

export function createAttributeComponent<TAttribute extends AnyAttributeConfig>(
  attribute: TAttribute,
  render: (props: {
    attribute: TAttribute;
    value: ValidatorOutput<TAttribute>;
    onValueChange: (value: ValidatorOutput<TAttribute>) => void;
  }) => JSX.Element
) {
  const Component = (props: {
    value: ValidatorOutput<TAttribute>;
    onValueChange: (value: ValidatorOutput<TAttribute>) => void;
  }) => {
    return render({
      attribute,
      ...props,
    });
  };

  Component[AttributeSymbol] = attribute.name;
  Component.displayName = `Attribute(${attribute.name})`;

  return Component as AttributeComponent<TAttribute>;
}
const AttributeSymbol = Symbol("Attribute");

interface AttributeComponent<TAttribute extends AnyAttributeConfig> {
  (props: {
    value: ValidatorOutput<TAttribute>;
    onValueChange: (value: ValidatorOutput<TAttribute>) => void;
  }): JSX.Element;
  [AttributeSymbol]: TAttribute["name"];
}

/// Create Field Component
export function createFieldComponent<const TField extends AnyFieldConfig>(
  field: TField,
  render: (props: {
    value: ValidatorOutput<TField>;
    onValueChange: (value: ValidatorOutput<TField>) => void;
    attributes: Partial<AttributeValues<TField["attributes"]>>;
  }) => JSX.Element
) {
  const Component = (props: any) => {
    return render(props);
  };

  Component[FieldSymbol] = field.name;
  Component.displayName = `Field(${field.name})`;

  return Component as FieldComponent<TField>;
}
const FieldSymbol = Symbol("Field");

interface FieldComponent<TField extends AnyFieldConfig> {
  (props: {
    id: string;
    attributes: Partial<AttributeValues<TField["attributes"]>>;
    value: ValidatorOutput<TField>;
    onValueChange: (value: ValidatorOutput<TField>) => void;
  }): JSX.Element;
  [FieldSymbol]: TField["name"];
}

///

type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};

interface AttributeConfig<TName extends string, TValue> {
  name: TName;
  validate: (
    value: unknown,
    context: { attributes: Record<string, unknown> }
  ) => TValue;
}

type AnyAttributeConfig = AttributeConfig<string, unknown>;

interface FieldConfig<
  TName extends string,
  TAttributes extends AttributeConfig<string, unknown>[],
  TValue,
> {
  name: TName;
  attributes: TAttributes;
  validate: (
    value: unknown,
    context: { attributes: AttributeValues<TAttributes> }
  ) => TValue;
}

type AnyFieldConfig = FieldConfig<string, AnyAttributeConfig[], unknown>;

type ValidatorOutput<T> = T extends {
  validate: (...args: any[]) => infer TOutput;
}
  ? TOutput
  : never;

interface Field {
  id: string;
  name: string;
  attributes: Record<string, any>;
  value: any;
}

function useAttributes<const TAttributes extends AnyAttributeConfig[]>(
  attributes: TAttributes
): {
  [K in TAttributes[number]["name"]]?: ValidatorOutput<
    EntityByName<TAttributes, K>
  >;
} {
  return undefined as any;
}

type EntityByName<
  TEntities extends any[],
  TName extends TEntities[number]["name"],
> = TEntities extends [infer TEntity extends { name: string }, ...infer TRest]
  ? TEntity["name"] extends TName
    ? TEntity
    : EntityByName<TRest, TName>
  : never;

type AttributeValues<TAttributes extends AnyAttributeConfig[]> = Simplify<{
  [K in TAttributes[number]["name"]]: ValidatorOutput<
    EntityByName<TAttributes, K>
  >;
}>;
