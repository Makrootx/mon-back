import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from 'src/guards/user.decorator';
import { UserTokenDto } from './dtos/token-user.dto';
import { AuthGuard } from 'src/guards/user.guard';
import { UserLoginDto } from './dtos/login-user.dto';
import { BlogCreateDto } from 'src/blog/dtos/create-blog.dto';
import { BlogUpdateDto } from 'src/blog/dtos/update-blog.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  registerUser(@Body() userDto: CreateUserDto) {
    return this.userService.createNewUser(userDto);
  }

  @Post('/login')
  loginUser(@Body() userDto: UserLoginDto) {
    return this.userService.loginUser(userDto);
  }

  @UseGuards(AuthGuard)
  @Get('/auth/getUser')
  async getuser(@User() userPayload: UserTokenDto) {
    return await this.userService.getUser(userPayload.id);
  }

  @UseGuards(AuthGuard)
  @Post('/auth/createBlog')
  createBlog(@User() userDto: UserTokenDto, @Body() blogDto: BlogCreateDto) {
    return this.userService.createBlog(userDto, blogDto);
  }

  @UseGuards(AuthGuard)
  @Get('/auth/getUserWithBlogs')
  getUserWithBlogs(@User() userDto: UserTokenDto) {
    return this.userService.getUserWithBlogs(userDto.id);
  }

  @UseGuards(AuthGuard)
  @Patch('/auth/updateBlog')
  updateBlog(@User() userDto: UserTokenDto, @Body() blogDto: BlogUpdateDto) {
    return this.userService.updateUserBlog(userDto, blogDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/auth/deleteBlog')
  async deleteBlog(
    @User() userDto: UserTokenDto,
    @Body() blogId: { id: string },
  ) {
    try {
      await this.userService.deleteUserBlog(userDto, blogId.id);
      return HttpStatus.ACCEPTED;
    } catch (err) {
      throw err;
    }
  }

  @Post('/getUserBlogs')
  getEnternalUserBlogs(@Body() userDto: { email: string }) {
    return this.userService.getUserBlogs(userDto.email);
  }

  @Post('/getUser')
  async getEnternalUser(@Body() userDto: { email: string }) {
    const user = await this.userService.findUserByEmail(userDto.email);
    return this.userService.getUser(user.id);
  }
}
