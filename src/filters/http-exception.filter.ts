import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if ('message' in exceptionResponse) {
      const msg = (exceptionResponse as { message: unknown }).message;
      message =
        typeof msg === 'string' || Array.isArray(msg)
          ? (msg as string | string[])
          : exception.message;
    } else {
      message = exception.message;
    }

    response.status(status).json({
      error: {
        message,
        statusCode: status,
      },
    });
  }
}
