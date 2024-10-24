import {
  ComparisonOperator,
  ObjectLiteral,
  ParamsOptions,
  QueryFields,
  QueryFilter,
  QueryJoin,
  RequestQueryException,
  validateComparisonOperator,
  validateCondition,
  validateFields,
  validateJoin,
  validateParamOption,
  validateSort,
  validateUUID,
} from "../../src";

describe("#ReuqestValidation Test", () => {
  it("Should throw `invalid fields` for #QueryFields", () => {
    const testNull = () => {
      validateFields(<QueryFields>[null, "", "ws", "22"]);
    };

    const testBool = () => {
      validateFields(<QueryFields>[true, "", "ws", "22"]);
    };

    const testUndefined = () => {
      validateFields(<QueryFields>[undefined, "", "ws", "22"]);
    };

    const testNumber = () => {
      validateFields(<QueryFields>[12, "", "ws", "22"]);
    };

    expect(testNull).toThrow(RequestQueryException);
    try {
      testNull();
    } catch (e: any) {
      expect(e.message).toContain("Invalid fields. Array of strings expected");
    }

    expect(testBool).toThrow(RequestQueryException);
    try {
      testBool();
    } catch (e: any) {
      expect(e.message).toContain("Invalid fields. Array of strings expected");
    }

    expect(testUndefined).toThrow(RequestQueryException);
    try {
      testUndefined();
    } catch (e: any) {
      expect(e.message).toContain("Invalid fields. Array of strings expected");
    }

    expect(testNumber).toThrow(RequestQueryException);
    try {
      testNumber();
    } catch (e: any) {
      expect(e.message).toContain("Invalid fields. Array of strings expected");
    }
  });

  it("Should throw `Invalid field type in` for #QueryFilter conditions", () => {
    const test = () => {
      validateCondition(<QueryFilter>{}, <any>"", {});
    };
    const testFilter = () => {
      validateCondition(<any>null, "search", {});
    };

    expect(test).toThrow(RequestQueryException);
    try {
      test();
    } catch (e: any) {
      expect(e.message).toContain("Invalid field type in");
    }

    expect(testFilter).toThrow(RequestQueryException);
    try {
      testFilter();
    } catch (e: any) {
      expect(e.message).toContain("Invalid field type in");
    }
  });

  it("Should throw `Invalid comparison operator` for #ComparisonOperator", () => {
    const test = (
      comparison: string,
      customOperatorsList: ObjectLiteral = {}
    ) => {
      validateComparisonOperator(
        <ComparisonOperator>comparison,
        customOperatorsList
      );
    };

    try {
      test("$customAdded", {});
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toContain("Invalid comparison operator");
    }

    // same as previows but with default customOperators usage
    try {
      validateComparisonOperator(<ComparisonOperator>"$customOperator");
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toContain("Invalid comparison operator");
    }

    // should not throw anything as it as valid custom operator
    try {
      test("$customAdded", { $customAdded: "" });
      expect(1).toEqual(1);
    } catch (e: any) {
      expect(1).toEqual(2);
    }
  });

  it("Should throw `Invalid join field|select. Array of strings expected` for #QueryJoin", () => {
    const test = (join: any) => {
      validateJoin(<any>join);
    };

    try {
      test(null);
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid join field. String expected");
    }

    try {
      test({ field: null });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid join field. String expected");
    }

    try {
      test({ field: 12 });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid join field. String expected");
    }

    try {
      test({ field: true });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid join field. String expected");
    }

    try {
      test({ field: "someField", select: undefined });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual(
        "Invalid join select. Array of strings expected"
      );
    }

    try {
      test({ field: "someField", select: [12, "string", true] });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual(
        "Invalid join select. Array of strings expected"
      );
    }

    try {
      test({ field: "someField", select: 26 });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual(
        "Invalid join select. Array of strings expected"
      );
    }
  });

  it("Should throw `Invalid sort field. String expected` and `Invalid sort order` for #QuerySort", () => {
    const test = (sort: any) => {
      validateSort(sort);
    };

    try {
      test(null);
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid sort field. String expected");
    }

    try {
      test({ field: undefined });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid sort field. String expected");
    }

    try {
      test({ field: "someField", order: "INVALID_ORDER" });
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toContain("Invalid sort order.");
    }
  });

  it("Shold throw `Invalid param` and `Invalid param option in Crud` for #ParamsOptions", () => {
    const test = (options: ParamsOptions, name: string) => {
      validateParamOption(options, name);
    };

    try {
      test(<any>null, "");
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toContain("Invalid param");
      expect(e.message).toContain("Invalid crud options");
    }

    try {
      const options = {
        someSlugField: null,
      };

      test(<any>options, "someSlugField");
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid param option in Crud");
    }

    try {
      const options = {
        someSlugField: {
          field: "any",
        },
      };

      test(<any>options, "someSlugField");
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid param option in Crud");
    }

    try {
      const options = {
        someSlugField: {
          type: "any",
        },
      };

      test(<any>options, "someSlugField");
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toEqual("Invalid param option in Crud");
    }

    // disabled scenario, throw nothing, return nothing;
    try {
      const options = {
        someSlugField: {
          disabled: true,
        },
      };

      const returnValue = test(options, "someSlugField");
      expect(returnValue).toBeUndefined();
    } catch (e: any) {
      expect(1).toEqual(2);
    }
  });

  it("Should throw `UUID string expected`", () => {
    try {
      validateUUID("inv-uuid-xx9871-1882", "any");
    } catch (e: any) {
      expect(e.constructor.name).toEqual("RequestQueryException");
      expect(e.message).toContain("UUID string expected");
    }
  });
});
