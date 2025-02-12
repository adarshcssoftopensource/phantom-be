import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const error =
      typeof errorResponse['message'] === 'string'
        ? errorResponse['message']
        : errorResponse['message'][0];

    response.status(status).json({
      success: false,
      message: 'Validation failed',
      errors: error,
    });
  }
}
