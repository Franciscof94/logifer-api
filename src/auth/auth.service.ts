import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Users } from '../users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
        active: true,
      },
      relations: ['userRoles'],
    });

    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return {
      user,
      accessToken: this.getJwtToken({
        id: user.id,
        user,
        refreshToken: this.getRefreshToken({
          id: user.id,
        }),
      }),
      refreshToken: this.getRefreshToken({
        id: user.id,
      }),
    };
  }

  async refresh(user: Users) {
    return {
      /* user,
      permissions, */
      accessToken: this.getJwtToken({
        id: user.id,
        user,
      }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private getRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
    });
  }
}
