import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService, LoginPayload } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isSubmitting = false;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.error = null;

    this.authService.login(this.form.value as LoginPayload).subscribe({
      next: () => {
        const user = this.authService.currentUser;
        if (user?.role === 'ADMIN') {
          this.router.navigate(['/admin']);
          return;
        }
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/';
        this.router.navigate([redirectTo]);
      },
      error: () => {
        this.error = 'Identifiants invalides.';
        this.isSubmitting = false;
      },
    });
  }
}
