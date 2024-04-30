import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseDto } from './dto/base.dto';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, response);
    } else {
      console.log(exception);
      this.handleHttpException(new InternalServerErrorException(), response);
    }
  }

  handleHttpException(exception: HttpException, response: Response) {
    const exceptionResponse = exception.getResponse() as {
      message: string | string[];
      error: string;
    };

    const errors: string[] = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message
      : [exceptionResponse.message];

    const resBody = new BaseDto(exceptionResponse.error, null, errors);
    response.status(exception.getStatus()).json(resBody);
  }
}
