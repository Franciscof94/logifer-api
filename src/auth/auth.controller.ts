import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshAuthGuard } from './guard/refresh.guard';
import { Users } from '../users/entities/users.entity';
import { GetUser } from './decorators/get-user-decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refresh')
  refresh(@GetUser() user: Users) {
    return this.authService.refresh(user);
  }
}
