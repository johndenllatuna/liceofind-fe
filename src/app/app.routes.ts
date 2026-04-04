import { Routes } from '@angular/router';
import { Login } from './admin/admin-login/admin-login.component';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard.component'; 
import { ItemManagement } from './admin/item-management/item-management.component';
import { PostItem } from './admin/post-item/post-item.component'; 
import { ClaimVerification } from './admin/claim-verification/claim-verification.component';

export const routes: Routes = [
  { path: '', component: Login }, 
  { path: 'dashboard', component: AdminDashboard},  
  { path: 'item-management', component: ItemManagement},
  { path: 'claim-verification', component: ClaimVerification },
  { path: 'post-item', component: PostItem } // 2. Add the route right here
];