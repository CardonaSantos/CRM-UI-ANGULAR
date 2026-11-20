/** DTOs de SERVER_CRM_NOVA `auth.controller.ts`. */
export interface LoginDto {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
}
