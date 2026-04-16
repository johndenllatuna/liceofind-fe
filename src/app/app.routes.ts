import { Routes } from '@angular/router';

// ── Admin ──────────────────────────────────────────────────────────────────────
import { AdminLogin } from './admin/admin-login/admin-login.component';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard.component';
import { ItemManagement } from './admin/item-management/item-management.component';
import { PostItem } from './admin/post-item/post-item.component';
import { ClaimVerification } from './admin/claim-verification/claim-verification.component';
import { SettledItems } from './admin/settled-items/settled-items.component';
import { UserManagement } from './admin/user-management/user-management.component';

// ── User ───────────────────────────────────────────────────────────────────────
import { UserLogin } from './user/user-login/user-login.component';
import { UserHome } from './user/user-home/user-home.component';
import { ItemDetail } from './user/item-detail/item-detail.component';
import { UserProfile } from './user/user-profile/user-profile.component';
import { UserRegisterComponent } from './user/user-register/user-register.component';
import { UserVerifyOtpComponent } from './user/user-verify-otp/user-verify-otp';
import { MyClaims } from './user/my-claims/my-claims';
import { ForgotPassword } from './user/forgot-password/forgot-password';
import { ResetPasswordComponent } from './user/reset-password/reset-password';

export const routes: Routes = [
  // ── Root Route (Default to User Login) ───────────────────────────────────────
  { path: '', component: UserLogin },
  { path: 'register', component: UserRegisterComponent },
  { path: 'verify-otp', component: UserVerifyOtpComponent },

  // ── Admin routes ─────────────────────────────────────────────────────────────
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'item-management', component: ItemManagement },
  { path: 'claim-verification', component: ClaimVerification },
  { path: 'post-item', component: PostItem },
  { path: 'settled-items', component: SettledItems },
  { path: 'user-management', component: UserManagement },

  // ── User routes ───────────────────────────────────────────────────────────────
  { path: 'user/login', component: UserLogin },
  { path: 'user/home', component: UserHome },
  { path: 'user/item/:id', component: ItemDetail },
  { path: 'user/profile', component: UserProfile },
  { path: 'user/my-claims', component: MyClaims },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPasswordComponent }
];