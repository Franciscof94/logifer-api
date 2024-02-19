import { Users } from '../../users/entities/users.entity';

export interface JwtPayload {
  id: number;
  user?: Users;
  refreshToken?: string;
}
