import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  passwordMismatch = false;
  successMode = false;

  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  showToast = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);
  isTokenInvalid = signal(false); // Added boolean flag for token invalidity

  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  private triggerToast(message: string) {
    this.errorMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword || this.isLoading()) {
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.triggerToast('Passwords do not match');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      token: this.token,
      newPassword: this.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMode = true;
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Reset password error:', err);
        // Display invalid token state instead of toast
        this.isTokenInvalid.set(true);
      }
    });
  }
}
