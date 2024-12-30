import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Custom validator to disallow '{{variable}}' pattern
@ValidatorConstraint({ name: 'NoVariablePattern', async: false })
export class NoVariablePattern implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const regex = /{{.*?}}/; // Matches patterns like {{name}}, {{description}}
    return !regex.test(value); // Returns true if the pattern is NOT present
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must not contain variable patterns like '{{variable}}'.`;
  }
}

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @Validate(NoVariablePattern) // Apply the custom validator
  name: string;

  @IsOptional()
  @IsString()
  @Validate(NoVariablePattern) // Apply the custom validator
  description?: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
