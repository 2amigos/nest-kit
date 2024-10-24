import {
  BulkDto,
  MergedCrudOptions,
  createBulkDto,
  hasValue,
  isArrayOfStrings,
  isArrayOfStringsFull,
  isFalse,
  isTrue,
  isValue,
} from "../../src";
import { safeRequire } from "../../src/helpers/safe-require.helper";
import { TestingModel } from "../__fixture__/model/testing-model.model";

describe("#Helpers", () => {
  it("Should be an array of strings", () => {
    expect(isArrayOfStrings(["str", "str", ""])).toBeTruthy();
    expect(isArrayOfStrings(["str", "str", 1])).toBeFalsy();
  });

  it("Should assert whether is array and not empty", () => {
    expect(isArrayOfStringsFull(["str", "str", " "])).toBeTruthy();
    expect(isArrayOfStringsFull(["str", "str", 1])).toBeFalsy();
    expect(isArrayOfStringsFull(["str", "str", ""])).toBeFalsy();
  });

  it("Should not be empty", () => {
    expect(isValue("str")).toBeTruthy();
    expect(isValue(1)).toBeTruthy();
    expect(isValue(true)).toBeTruthy();
    expect(isValue(false)).toBeTruthy();
    expect(isValue(new Date())).toBeTruthy();
    expect(isValue(undefined)).toBeFalsy();
    expect(isValue(null)).toBeFalsy();
  });

  it("Should be an array with value", () => {
    expect(hasValue(["str", 1, true])).toBeTruthy();
    expect(hasValue([undefined])).toBeFalsy();
  });

  it("Should be true", () => {
    expect(isTrue(true)).toBeTruthy();
    expect(isTrue(1 == 1)).toBeTruthy();
    expect(isTrue(1)).toBeFalsy();
  });

  it("Should be false", () => {
    expect(isFalse(false)).toBeTruthy();
    expect(isFalse(1 > 2)).toBeTruthy();
    expect(isFalse(0)).toBeFalsy();
  });

  it("Should throw exception on safe require", () => {
    const req = safeRequire("", () => {
      throw new Error("sample error throw");
    });

    expect(req).toBeNull();
  });

  it("Should return a BulkDto", () => {
    const options = <MergedCrudOptions>{
      model: {
        type: TestingModel,
      },
      serialize: {
        createMany: TestingModel,
      },
      params: {
        id: {
          field: "id",
          primary: true,
          type: "number",
        },
      },
      validation: false,
    };
    const dto = createBulkDto(options);

    expect(new dto()).toBeInstanceOf(BulkDto);
  });
});
