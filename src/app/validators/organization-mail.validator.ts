import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const supportedNames = [
    'info',
    'sensor',
    'beheer',
    'privacy',
    'kcc',
    'service',
    'klant',
    'gemeente',
    'support',
    'help',
    'ondersteuning',
    'informatie',
    'management',
    'team',
    'afdeling',
    'data',
];

export function createOrganizationMailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (!value) {
            return null;
        }

        const domainsRegexPart = supportedNames.join('|');
        const emailMatchesDomains = new RegExp(`^.*(${domainsRegexPart}).*@.+[.].+$`).test(value);

        return !emailMatchesDomains ? { mismatch: true } : null;
    };
}
