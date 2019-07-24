import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  isNameValid,
  isEmailValid,
  isMobileNumberValid,
  isDateValid,
} from '@aph/universal/aphValidators';

@ValidatorConstraint({ name: 'name' })
export class NameValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isNameValid(text);
  }
}

@ValidatorConstraint({ name: 'mobile number' })
export class MobileNumberValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isMobileNumberValid(text);
  }
}

@ValidatorConstraint({ name: 'email' })
export class EmailValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isEmailValid(text);
  }
}

@ValidatorConstraint({ name: 'date' })
export class DateValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return isDateValid(text);
  }
}
