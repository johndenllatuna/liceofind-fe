import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule], // Required for [formGroup] to work
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLogin {
  loginForm: FormGroup;
  loginError: boolean = false;

  isForgotPasswordMode: boolean = false;
  resetLinkSent: boolean = false;

  /** Parallax: CSS transform string applied to .bg-parallax */
  bgTransform: string = 'translate(0%, 0%)';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize your form with validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  /** Parallax mouse handler: moves bg in the opposite direction of the cursor
   *  at 2% intensity for a subtle, sophisticated depth effect. */
  onMouseMove(event: MouseEvent): void {
    const { clientX, clientY, currentTarget } = event;
    const el = currentTarget as HTMLElement;
    const { width, height } = el.getBoundingClientRect();
    // Map [0, width/height] → [-1, 1]
    const x = (clientX / width - 0.5) * 2;
    const y = (clientY / height - 0.5) * 2;
    // 2% max translate — enough to feel alive, not distracting
    const intensity = 2;
    this.bgTransform = `translate(${-x * intensity}%, ${-y * intensity}%)`;
  }

  // --- NEW METHODS FOR FORGOT PASSWORD ---

  // Toggles the UI between the Login screen and Forgot Password screen
  toggleForgotPassword() {
    this.isForgotPasswordMode = !this.isForgotPasswordMode;
    this.resetLinkSent = false; // Reset the success message
    this.loginError = false;    // Clear any login errors

    // If we are entering forgot password mode, we don't require the password field anymore
    if (this.isForgotPasswordMode) {
      this.loginForm.get('password')?.clearValidators();
    } else {
      this.loginForm.get('password')?.setValidators(Validators.required);
    }
    this.loginForm.get('password')?.updateValueAndValidity();
  }

  // Simulates sending the reset email
  onResetPassword() {
    if (this.loginForm.get('email')?.valid) {
      // In a real app, you would call this.authService.sendResetLink(email) here.
      // For now, we just show the success UI.
      this.resetLinkSent = true;
    }
  }

  // --- EXISTING LOGIN LOGIC ---

  onSignIn(event: Event) {
    event.preventDefault(); // Prevents page reload

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password, 'Admin').subscribe({
        next: (response) => {
          this.loginError = false;
          this.router.navigate(['/admin-dashboard']);
        },
        error: (err) => {
          this.loginError = true;
          console.error('Login failed:', err);
        }
      });
    } else {
      // If the form is invalid (e.g., empty fields), force it to show errors
      this.loginForm.markAllAsTouched();
    }
  }
}