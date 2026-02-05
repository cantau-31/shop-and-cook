import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  isSubmitting = false;
  error: string | null = null;

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notifications: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.form.patchValue({
      displayName: user.displayName,
      email: user.email
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.error = null;

    const { displayName, email } = this.form.value;
    this.userService.updateProfile({ displayName: displayName!, email: email! }).subscribe({
      next: (user) => {
        this.authService.updateStoredUser(user);
        this.notifications.success('Profil mis à jour');
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.error = 'Impossible de mettre à jour le profil.';
        this.isSubmitting = false;
      }
    });
  }
}
