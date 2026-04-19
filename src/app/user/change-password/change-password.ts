import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword implements OnInit {
  passwordForm!: FormGroup;
  isLoading = signal(false);

  // Toast state
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);
  private toastTimer: any;

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit() {
    window.scrollTo(0, 0);
    this.initForm();
  }

  private initForm() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [
        this.notSameAsCurrentValidator,
        this.mustMatchValidator('newPassword', 'confirmPassword')
      ]
    });
  }

  // Custom Validator: New password cannot be same as current
  private notSameAsCurrentValidator(group: AbstractControl): ValidationErrors | null {
    const oldPass = group.get('oldPassword')?.value;
    const newPass = group.get('newPassword')?.value;
    
    if (oldPass && newPass && oldPass === newPass) {
      group.get('newPassword')?.setErrors({ sameAsCurrent: true });
      return { sameAsCurrent: true };
    }
    return null;
  }

  // Custom Validator: Confirm password must match new password
  private mustMatchValidator(controlName: string, matchingControlName: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) return null;

      // If another validator has already found an error on the matchingControl, return
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

  showToast(message: string, type: 'success' | 'error') {
    clearTimeout(this.toastTimer);
    this.toast.set({ message, type });
    this.toastTimer = setTimeout(() => this.toast.set(null), 3500);
  }

  onSubmit() {
    if (this.isLoading()) return;
    
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword } = this.passwordForm.value;
    const userId = this.authService.getCurrentUser()?.id;

    if (!userId) {
      this.showToast('Session expired. Please log in again.', 'error');
      return;
    }

    this.isLoading.set(true);

    this.authService.changePassword({
      userId,
      oldPassword,
      newPassword
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.showToast(res.message || 'Password changed successfully!', 'success');
        this.passwordForm.reset();
        setTimeout(() => this.router.navigate(['/user/profile']), 2200);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err.error?.message || '';
        
        if (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('old password')) {
          this.passwordForm.get('oldPassword')?.setErrors({ incorrect: true });
        } else {
          this.showToast(errorMessage || 'Failed to change password.', 'error');
        }
      }
    });
  }
}
