import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NonAdminGuard } from './guards/non-admin.guard';
import { AdminComponent } from './pages/admin/admin.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';
import { RecipeEditorComponent } from './pages/recipe-editor/recipe-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [NonAdminGuard] },
  { path: 'recipe/:id', component: RecipeDetailComponent, canActivate: [NonAdminGuard] },
  {
    path: 'recipes/new',
    component: RecipeEditorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER'] }
  },
  {
    path: 'recipes/:id/edit',
    component: RecipeEditorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER'] }
  },
  {
    path: 'profile/edit',
    component: ProfileEditComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER'] }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '' },
];
