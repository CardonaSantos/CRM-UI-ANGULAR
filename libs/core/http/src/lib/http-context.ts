import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Desactiva el toast global de error para una petición que maneja su error localmente. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const skipErrorToast = (context = new HttpContext()) => context.set(SKIP_ERROR_TOAST, true);
