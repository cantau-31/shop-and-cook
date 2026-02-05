import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  isSubmitting = false;
  success = false;
  error: string | null = null;

  form = this.fb.group(
    {
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: [ResetPasswordComponent.passwordsMatch] }
  );

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.patchValue({ token });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const { token, password } = this.form.value;
    this.isSubmitting = true;
    this.error = null;
    this.authService.resetPassword({ token: token ?? '', password: password ?? '' }).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.error = 'Token invalide ou expiré.';
      },
      complete: () => (this.isSubmitting = false)
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
