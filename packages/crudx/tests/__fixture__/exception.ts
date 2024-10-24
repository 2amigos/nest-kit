import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";

import { RequestQueryException } from "../../src";

@Catch(RequestQueryException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: RequestQueryException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    console.log("handling response", exception.message);
    response.status(400).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
