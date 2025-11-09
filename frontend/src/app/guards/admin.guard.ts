import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener el usuario actual
  let currentUser: any = null;
  authService.currentUser$.subscribe(user => {
    currentUser = user;
  }).unsubscribe();

  // Verificar si es admin
  if (currentUser && currentUser.role === 'ADMIN') {
    return true;
  }

  // Si no es admin, redirigir al dashboard
  router.navigate(['/dashboard']);
  return false;
};
