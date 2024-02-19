import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*  @Post()
  createNewUser(@Body() createUserDto: CreateUserDto) {
    return this.docentesService.createNewUser(createUserDto);
  }

  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.docentesService.loginUser(loginUserDto);
  }

  @Get('/login/me')
  userMe(@Headers('authorization') authorization: string) {
    return this.docentesService.userMe(authorization);
  } */
}
