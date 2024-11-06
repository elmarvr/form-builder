export interface AttributeContext {
  field: UnknownField;
}

export class Attribute<TName extends string, TValue> {
  name: TName;
  validate: (value: unknown, context: AttributeContext) => TValue;

  constructor(opts: {
    name: TName;
    validate: (value: unknown, context: AttributeContext) => TValue;
  }) {
    this.name = opts.name;
    this.validate = opts.validate;
  }
}

export type UnknownAttribute = Attribute<string, unknown>;

export type AttributeValues<TAttributes extends UnknownAttribute[]> = {
  [K in TAttributes[number]["name"]]: ReturnType<
    Extract<TAttributes[number], { name: K }>["validate"]
  >;
};

export class Field<
  TName extends string,
  const TAttributes extends UnknownAttribute[],
  TValue,
> {
  name: TName;
  attributes: TAttributes;
  validate: (value: unknown, context: AttributeContext) => TValue;

  constructor(opts: {
    name: TName;
    attributes: TAttributes;
    validate: (value: unknown, context: AttributeContext) => TValue;
  }) {
    this.name = opts.name;
    this.attributes = opts.attributes;
    this.validate = opts.validate;
  }
}

export type UnknownField = Field<string, UnknownAttribute[], unknown>;
