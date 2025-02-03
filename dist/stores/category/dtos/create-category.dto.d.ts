import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class NoVariablePattern implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class CreateCategoryDto {
    name: string;
    description?: string;
    parentId?: number;
}
