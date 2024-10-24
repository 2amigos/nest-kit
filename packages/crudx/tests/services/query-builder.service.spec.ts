import {
  CreateQueryParams,
  CustomOperatorQuery,
  CustomOperators,
  QueryBuilderService,
  QueryFilter,
  QueryJoin,
  RequestQueryBuilderOptions,
  SCondition,
  SerializeHelper,
} from "../../src";

describe("#Query Builder", () => {
  it("Should create a query builder", () => {
    const qb = QueryBuilderService.create();
    expect(qb).toBeInstanceOf(QueryBuilderService);
  });

  it("Should craate qb with builder params and custom query delimiters", () => {
    const params = <CreateQueryParams>{
      fields: ["firstName", "lastName"],
      filter: [
        <QueryFilter>{
          field: "age",
          operator: "$gte",
          value: 21,
        },
        <QueryFilter>{
          field: "relationTestId",
          operator: "$notnull",
        },
      ],
      resetCache: true,
    };

    const qbOptions = <RequestQueryBuilderOptions>{
      delim: "_",
    };

    QueryBuilderService.setOptions(qbOptions);
    const qb = QueryBuilderService.create(params, {});
    const qs = qb.query(false);

    expect(QueryBuilderService.getOptions().delim).toEqual("_");
    expect(qs).toContain("fields=firstName,lastName");
    expect(qs).toContain("filter[0]=age_$gte_21");

    QueryBuilderService.setOptions(<RequestQueryBuilderOptions>{
      delim: "||",
    });
  });

  it("Should create a qb with search param, with encoded result", () => {
    const qb = QueryBuilderService.create().search(<SCondition>{
      $gte: { age: 21 },
    });

    const qs = qb.query(false);
    const qsEncoded = qb.query();

    expect(qs).toEqual('s={"$gte":{"age":21}}');
    expect(qsEncoded).toEqual("s=%7B%22%24gte%22%3A%7B%22age%22%3A21%7D%7D");
  });

  it("Should apply order param", () => {
    const qb = QueryBuilderService.create().sortBy({
      field: "age",
      order: "DESC",
    });

    const qs = qb.query(false);
    expect(qs).toEqual("sort[0]=age,DESC");

    const qb2 = QueryBuilderService.create().sortBy([
      { field: "age", order: "DESC" },
      { field: "name", order: "ASC" },
    ]);

    const qs2 = qb2.query(false);
    expect(qs2).toEqual("sort[0]=age,DESC&sort[1]=name,ASC");
  });

  it("Should apply join param", () => {
    const qb = QueryBuilderService.create().setJoin(<QueryJoin>{
      field: "relationTest",
      select: ["name"],
    });

    const qs = qb.query(false);
    expect(qs).toEqual("join[0]=relationTest||name");

    const qb2 = QueryBuilderService.create().setJoin([
      <QueryJoin>{
        field: "relationTest",
        select: ["name"],
      },
    ]);

    const qs2 = qb2.query(false);
    expect(qs2).toEqual("join[0]=relationTest||name");
  });

  it("Should create a response DTO", () => {
    const dto = SerializeHelper.createGetOneResponseDto("modelTest");

    expect(dto.name).toEqual("modelTestResponseDto");
  });
});
