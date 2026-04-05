import { AbstractControl } from '@angular/forms';

export function sriLankanPhoneValidator(control: AbstractControl) {
  const phoneRegex = /^(?:\+94|0)?7\d{8}$/;

  if (!control.value) return null;

  return phoneRegex.test(control.value)
    ? null
    : { invalidPhone: true };
}
