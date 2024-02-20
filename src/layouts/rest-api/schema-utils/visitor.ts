import type { Operation, Parameter, TypeDef, Property, Response } from ".";

export type Visitor = {
  -readonly [key in keyof typeof defaultVisitor]: (typeof defaultVisitor)[key];
};
export const defaultVisitor = {
  visitSchemaPaths(schemaPaths: {
    [pathname: string]: { [method: string]: Operation };
  }) {
    for (const path in schemaPaths) {
      const endpoint = schemaPaths[path];
      if (endpoint) this.visitEndpoint(path, endpoint);
    }
  },
  visitEndpoint(_path: string, endpoint: { [method: string]: Operation }) {
    for (const method in endpoint) {
      const operation = endpoint[method];
      if (operation) this.visitOperation(method, operation);
    }
  },
  visitOperation(_method: string, operation: Operation) {
    if (operation.parameters) {
      for (const parameter of operation.parameters) {
        this.visitParameter(parameter);
      }
    }
    if (operation.requestBody) {
      this.visitRequestRef(
        operation.requestBody.content["application/json"].schema.$ref || "",
      );
    }
    for (const statusCode in operation.responses) {
      const response = operation.responses[statusCode];
      if (response) this.visitResponse(statusCode, response);
    }
  },
  visitParameter(_parameter: Parameter) {},
  visitRequestRef(_ref: string) {},
  visitResponse(_statusCode: string, response: Response) {
    if (response.schema) {
      this.visitResponseRef(response.schema.$ref || "");
    } else if (response.content?.["application/json"]?.schema.$ref) {
      // TODO: handle others (e.g. "text/csv")
      this.visitResponseRef(
        response.content["application/json"].schema.$ref || "",
      );
    }
  },
  visitResponseRef(_ref: string) {},
  visitTypeDef(typeDef: TypeDef) {
    if (typeDef.oneOf) {
      this.visitUnion(typeDef as Parameters<typeof this.visitUnion>[0]);
    }
    if (typeDef.properties) {
      this.visitObject(typeDef as Parameters<typeof this.visitObject>[0]);
    }
  },
  visitUnion(typeDef: TypeDef & { oneOf: NonNullable<TypeDef["oneOf"]> }) {
    for (const item of typeDef.oneOf) {
      this.visitTypeDef(item);
    }
  },
  visitObject(
    typeDef: TypeDef & { properties: NonNullable<TypeDef["properties"]> },
  ) {
    for (const name in typeDef.properties) {
      const property = typeDef.properties[name];
      if (property) this.visitProperty(name, property);
    }
  },
  visitProperty(_name: string, _property: Property) {},
} as const;
