import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const payload =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : (exceptionResponse as Record<string, any>);

      const errorBody: ErrorResponse = {
        code: payload['code'] ?? 'ERR_HTTP_EXCEPTION',
        message: payload['message'] ?? 'Unexpected error',
        details: payload['details']
      };

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `[${errorBody.code}] ${errorBody.message}`,
          exception.stack ?? 'No stack',
          payload['context']
        );
      }

      response.status(status).json(errorBody);
      return;
    }

    this.logger.error('Unhandled error', (exception as Error)?.stack);

    const errorBody: ErrorResponse = {
      code: 'ERR_INTERNAL_SERVER',
      message: 'Internal server error'
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorBody);
  }
}
