export class BaseDto<Type> {
  public readonly message: string;

  public readonly data: Type | Type[] | null;

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
