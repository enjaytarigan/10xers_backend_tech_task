import { ApiProperty } from '@nestjs/swagger';

export class BaseDto<Type> {
  @ApiProperty()
  public readonly message: string;

  @ApiProperty()
  public readonly data: Type | Type[] | null;

  @ApiProperty()
  public readonly errors: string[] | undefined = undefined;

  constructor(
    message: string,
    data: Type | Type[] | null,
    errors?: string[] | null,
  ) {
    this.message = message;
    this.data = data;
    this.errors = Array.isArray(errors) ? errors : undefined;
  }
}
