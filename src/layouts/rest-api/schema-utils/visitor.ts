import type { Operation, Parameter, Response } from "./operation";
import type { Property, TypeDef } from "./type-def";

export type Visitor = {
  -readonly [key in keyof typeof defaultVisitor]: (typeof defaultVisitor)[key];
};
export const defaultVisitor = {
  visitSchemaPaths(schemaPaths: {
    [pathname: string]: { [method: string]: Operation };
  }) {
    for (const path in schemaPaths) {
      this.visitEndpoint(path, schemaPaths[path]!);
    }
  },
  visitEndpoint(_path: string, endpoint: { [method: string]: Operation }) {
    for (const method in endpoint) {
      this.visitOperation(method, endpoint[method]!);
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
      const response = operation.responses[statusCode]!;
      this.visitResponse(statusCode, response);
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
    if (typeDef.oneOf) this.visitUnion(typeDef);
    if (typeDef.properties) this.visitObject(typeDef);
  },
  visitUnion(typeDef: TypeDef) {
    for (const item of typeDef.oneOf!) {
      this.visitTypeDef(item);
    }
  },
  visitObject(typeDef: TypeDef) {
    for (const name in typeDef.properties) {
      this.visitProperty(name, typeDef.properties[name]!);
    }
  },
  visitProperty(_name: string, _property: Property) {},
} as const;
