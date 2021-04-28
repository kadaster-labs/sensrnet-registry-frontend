import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const supportedDomainNames = [
  'info', 'sensor', 'beheer', 'privacy', 'kcc', 'service', 'klant', 'gemeente'
];

export function createOrganizationMailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const domainsRegexPart = supportedDomainNames.join('|');
    const emailMatchesDomains = new RegExp(`^.*(${domainsRegexPart}).*@.+[.].+$`).test(value);

    return !emailMatchesDomains ? {mismatch: true} : null;
  };
}
