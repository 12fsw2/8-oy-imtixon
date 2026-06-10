import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let detail: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, any>;
        message = r.message ?? message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`${exception.message}\n${exception.stack}`);
      detail = exception.message;
    } else {
      this.logger.error(exception);
    }

    const isValidationError = Array.isArray(message);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: isValidationError ? 'Validation failed' : message,
      errors: isValidationError ? message : undefined,
      detail,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
