import { Routes } from '@angular/router';
import { AdminLogin } from './admin/admin-login/admin-login.component';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard.component'; 
import { ItemManagement } from './admin/item-management/item-management.component';
import { PostItem } from './admin/post-item/post-item.component'; 
import { ClaimVerification } from './admin/claim-verification/claim-verification.component';
import { SettledItems } from './admin/settled-items/settled-items.component';
import { UserManagement } from './admin/user-management/user-management.component';

export const routes: Routes = [
  { path: '', component: AdminLogin }, 
  { path: 'admin-dashboard', component: AdminDashboard},  
  { path: 'item-management', component: ItemManagement},
  { path: 'claim-verification', component: ClaimVerification },
  { path: 'post-item', component: PostItem },
  { path: 'settled-items', component: SettledItems },
  { path: 'user-management', component: UserManagement },
];