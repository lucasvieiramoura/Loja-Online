import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se o usuário possui um token válido no Signal, permite navegação
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Caso contrário, redireciona para a página de login
  router.navigate(['/login']);
  return false;
};
