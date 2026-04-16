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