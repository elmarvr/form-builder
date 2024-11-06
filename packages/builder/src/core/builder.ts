import { createId } from "@paralleldrive/cuid2";
import { Store } from "@tanstack/store";

import { AttributeValues, UnknownField } from "./primitives";

export type SchemaField = {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
};

export class Builder<const TFields extends UnknownField[]> {
  _def: {
    fields: TFields;
  };

  store = new Store({
    fields: [] as SchemaField[],
    attributeErrors: {} as Record<string, Record<string, Error | null>>,
  });

  constructor(opts: { fields: TFields }) {
    this._def = opts;
  }

  append<TName extends TFields[number]["name"]>(field: {
    type: TName;
    attributes?: Partial<
      AttributeValues<Extract<TFields[number], { name: TName }>["attributes"]>
    >;
  }) {
    this.store.setState((state) => ({
      ...state,
      fields: [
        ...state.fields,
        {
          id: createId(),
          type: field.type,
          attributes: field.attributes ?? {},
        },
      ],
    }));
  }

  remove(id: string) {
    this.store.setState((state) => ({
      ...state,
      fields: state.fields.filter((field) => field.id !== id),
    }));
  }

  update<TName extends TFields[number]["name"]>(
    id: string,
    field: {
      type: TName;
      attributes?: Partial<
        AttributeValues<Extract<TFields[number], { name: TName }>["attributes"]>
      >;
    }
  ) {
    this.store.setState((state) => {
      const fields = [...state.fields];
      const index = fields.findIndex((field) => field.id === id);

      if (index === -1) {
        return state;
      }

      fields[index] = {
        ...fields[index],
        ...field,
      };

      return {
        ...state,
        fields,
      };
    });
  }

  validateAttributes(id: string, attributes: Record<string, unknown>) {
    const field = this.store.state.fields.find((field) => field.id === id);
    const fieldDef = this._def.fields.find((f) => f.name === field?.type);

    const attributeDefs = fieldDef?.attributes ?? [];

    const errors: Record<string, Error> = {};

    for (const attribute of attributeDefs) {
      const value = attributes[attribute.name];

      try {
        attribute.validate(value, {} as never);
      } catch (error) {
        if (error instanceof Error) {
          errors[attribute.name] = error;
        }
      }
    }

    const hasErrors = Object.keys(errors).length > 0;

    this.store.setState((state) => ({
      ...state,
      attributeErrors: {
        ...state.attributeErrors,
        [id]: errors,
      },
    }));

    if (hasErrors) {
      return false;
    }

    this.update(id, {
      type: field?.type,
      attributes: attributes,
    } as never);

    return true;
  }
}

export type UnknownBuilder = Builder<UnknownField[]>;
