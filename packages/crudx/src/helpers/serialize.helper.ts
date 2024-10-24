import { Type } from "class-transformer";
import { GetManyDefaultResponse } from "../interfaces";

export class SerializeHelper {
  static createGetManyDto(dto: any, resourceName: string): any {
    class GetManyResponseDto implements GetManyDefaultResponse<any> {
      @Type(() => dto)
      // @ts-ignore
      data: any[];

      // @ts-ignore
      count: number;

      // @ts-ignore
      total: number;

      // @ts-ignore
      page: number;

      // @ts-ignore
      pageCount: number;
    }

    Object.defineProperty(GetManyResponseDto, "name", {
      writable: false,
      value: `GetMany${resourceName}ResponseDto`,
    });

    return GetManyResponseDto;
  }

  static createGetOneResponseDto(resourceName: string): any {
    class GetOneResponseDto {}

    Object.defineProperty(GetOneResponseDto, "name", {
      writable: false,
      value: `${resourceName}ResponseDto`,
    });

    return GetOneResponseDto;
  }
}
