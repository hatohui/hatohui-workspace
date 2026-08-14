import {
  registerDecorator,
  type ValidationOptions,
  type ValidationArguments,
} from 'class-validator';

export function isValidTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function IsTimezone(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimezone',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => isValidTimezone(value),
        defaultMessage: (args?: ValidationArguments) =>
          `${args?.property ?? 'value'} must be an IANA timezone name, e.g. Asia/Ho_Chi_Minh`,
      },
    });
  };
}
