import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule], // Required for [formGroup] to work
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLogin {
  loginForm: FormGroup;
  loginError: boolean = false; // Tracks if they typed the wrong password

  // --- NEW VARIABLES FOR FORGOT PASSWORD ---
  isForgotPasswordMode: boolean = false;
  resetLinkSent: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    // Initialize your form with validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
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
      
      // Pass the typed values to our auth service
      const isSuccess = this.authService.login(email, password);

      if (isSuccess) {
        this.loginError = false;
        // Logged in! Send them to the dashboard.
        this.router.navigate(['/admin-dashboard']); 
      } else {
        // Show error text if credentials don't match
        this.loginError = true;
      }
    }
  }
}