import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.scss'
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  registerForm!: FormGroup;

  bgTransform = 'translate(0%, 0%)';
  cardTransform = 'translate(0%, 0%)';

  private _motionHandler = (e: DeviceOrientationEvent) => this._onDeviceMotion(e);

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);

  // Toast notification state
  showToast = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.initForm();
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((state: string) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', this._motionHandler);
          }
        }).catch(() => { });
    } else {
      window.addEventListener('deviceorientation', this._motionHandler);
    }
  }

  private initForm() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, this.liceoEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [this.mustMatchValidator('password', 'confirmPassword')]
    });
  }

  private liceoEmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value?.toLowerCase() || '';
    if (email && !email.endsWith('@liceo.edu.ph')) {
      return { liceoDomain: true };
    }
    return null;
  }

  private mustMatchValidator(controlName: string, matchingControlName: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) return null;
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) return null;

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  ngOnDestroy(): void {
    window.removeEventListener('deviceorientation', this._motionHandler);
  }

  private _onDeviceMotion(e: DeviceOrientationEvent): void {
    const maxTilt = 20;
    const intensity = 1.2;
    const gamma = Math.max(-maxTilt, Math.min(maxTilt, e.gamma ?? 0));
    const beta = Math.max(-maxTilt, Math.min(maxTilt, e.beta ?? 0));
    const x = (gamma / maxTilt) * intensity;
    const y = (beta / maxTilt) * intensity;
    this.bgTransform = `translate(${x}%, ${y}%)`;
    this.cardTransform = `translate(${-x * 0.4}%, ${-y * 0.4}%)`;
  }

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update((v) => !v);
  }

  handleRegister() {
    if (this.isLoading()) return;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.registerForm.value;
    this.isLoading.set(true);
    this.registerForm.disable(); // Programmatically disable form during loading

    this.authService.register({
      name: fullName,
      email: email,
      password: password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.registerForm.enable();
        this.router.navigate(['/user/verify-otp'], {
          state: { name: fullName, email, password }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.registerForm.enable();
        const msg = err?.error?.message || 'Registration failed. Please try again.';
        this.triggerToast(msg);
        console.error('Registration failed:', err);
      }
    });
  }

  private triggerToast(message: string) {
    this.errorMessage.set(message);
    this.showToast.set(true);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }
}