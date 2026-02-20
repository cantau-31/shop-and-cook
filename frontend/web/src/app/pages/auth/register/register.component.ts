import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService, RegisterPayload } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private readonly privacyPolicyVersion = 'v1.0';
  isSubmitting = false;

  form = this.fb.group(
    {
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      privacyAccepted: [false, [Validators.requiredTrue]]
    },
    { validators: [RegisterComponent.passwordsMatch] }
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.isSubmitting = true;

    const { displayName, email, password, privacyAccepted } = this.form.value;
    this.authService.register({
      displayName,
      email,
      password,
      privacyAccepted: Boolean(privacyAccepted),
      privacyPolicyVersion: this.privacyPolicyVersion
    } as RegisterPayload).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => (this.isSubmitting = false),
    });
  }

  static passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordsMismatch: true };
    }
    return null;
  }
}
