import { inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query';
import { lastValueFrom } from 'rxjs';
import { AuthApi } from './auth.api';
import type { LoginDto } from './auth.models';

export function injectLogin() {
  const api = inject(AuthApi);
  return injectMutation(() => ({
    mutationFn: (dto: LoginDto) =>
      lastValueFrom(api.login({ correo: dto.correo.toLowerCase().trim(), contrasena: dto.contrasena })),
  }));
}
