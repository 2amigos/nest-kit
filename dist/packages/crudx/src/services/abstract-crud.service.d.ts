import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateManyDto, CrudRequest, CrudRequestOptions, GetManyDefaultResponse, ParsedRequestParams, QueryOptions } from "../interfaces";
export declare abstract class CrudService<T, DTO = T> {
    abstract getMany(req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]>;
    abstract getOne(req: CrudRequest): Promise<T>;
    abstract createOne(req: CrudRequest, dto: DTO): Promise<T>;
    abstract createMany(req: CrudRequest, dto: CreateManyDto): Promise<T[]>;
    abstract updateOne(req: CrudRequest, dto: DTO): Promise<T>;
    abstract replaceOne(req: CrudRequest, dto: DTO): Promise<T>;
    abstract deleteOne(req: CrudRequest): Promise<void | T>;
    abstract recoverOne(req: CrudRequest): Promise<void | T>;
    throwBadRequestException(msg?: any): BadRequestException;
    throwNotFoundException(name: string): NotFoundException;
    /**
     * Wrap page into page-info
     * override this method to create custom page-info response
     * or set custom `serialize.getMany` dto in the controller's CrudOption
     * @param data
     * @param total
     * @param limit
     * @param offset
     */
    createPageInfo(data: T[], total: number, limit: number, offset: number): GetManyDefaultResponse<T>;
    /**
     * Determine if need paging
     * @param parsed
     * @param options
     */
    decidePagination(parsed: ParsedRequestParams, options: CrudRequestOptions): boolean;
    /**
     * Get number of resources to be fetched
     * @param query
     * @param options
     */
    getTake(query: ParsedRequestParams, options: QueryOptions): number | null;
    /**
     * Get number of resources to be skipped
     * @param query
     * @param take
     */
    getSkip(query: ParsedRequestParams, take: number): number | null;
    /**
     * Get primary param name from CrudOptions
     * @param options
     */
    getPrimaryParams(options: CrudRequestOptions): string[];
}
