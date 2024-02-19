export enum RoleEnum {
  USER = 1,
  SUPERADMIN = 2,
  ADMIN = 3,
}

export function apiRoleToEnum(apiUserRole: string) {
  apiUserRole = apiUserRole.toUpperCase().trim();

  switch (apiUserRole) {
    case 'USER':
      return RoleEnum.USER;
    case 'SUPERADMIN':
      return RoleEnum.SUPERADMIN;
    case 'ADMIN':
      return RoleEnum.ADMIN;
    default:
      throw new Error(
        `El Rol '${apiUserRole}' no se pudo mapear a ningún rol existente`,
      );
  }
}
