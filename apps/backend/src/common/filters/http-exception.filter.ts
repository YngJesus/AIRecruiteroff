import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'An error occurred';
    let details: any = null;

    if (exception instanceof BadRequestException) {
      const err = exceptionResponse as any;
      message = err.message || 'Validation failed';
      details = err.error;
    } else if (typeof exceptionResponse === 'object') {
      const err = exceptionResponse as any;
      message = err.message || err.error || message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: status >= 500 ? 'Internal Server Error' : undefined,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
