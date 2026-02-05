import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  isSubmitting = false;
  success = false;
  resetToken: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.authService
      .requestPasswordReset(this.form.value.email as string)
      .subscribe({
        next: (response) => {
          this.success = true;
          this.resetToken = response.resetToken ?? null;
        },
        error: () => {
          this.success = false;
          this.resetToken = null;
        },
        complete: () => (this.isSubmitting = false),
      });
  }
}
