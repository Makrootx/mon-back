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

  @UseGuards(AuthGuard)
  @Get('/getUser')
  async getuser(@User() userPayload: UserTokenDto) {
    return await this.userService.findUserById(userPayload.id);
  }

  @Post('/login')
  loginUser(@Body() userDto: UserLoginDto) {
    return this.userService.loginUser(userDto);
  }

  @UseGuards(AuthGuard)
  @Post('/createBlog')
  createBlog(@User() userDto: UserTokenDto, @Body() blogDto: BlogCreateDto) {
    return this.userService.createBlog(userDto, blogDto);
  }

  @UseGuards(AuthGuard)
  @Get('')
  getUser(@User() userDto: UserTokenDto) {
    return this.userService.getUser(userDto);
  }

  @UseGuards(AuthGuard)
  @Get('/blogs')
  getUserWithBlogs(@User() userDto: UserTokenDto) {
    return this.userService.getUserWithBlogs(userDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/updateBlog')
  updateBlog(@User() userDto: UserTokenDto, @Body() blogDto: BlogUpdateDto) {
    return this.userService.updateUserBlog(userDto, blogDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteBlog')
  deleteBlog(@User() userDto: UserTokenDto, @Body() blogId: { id: string }) {
    console.log(blogId.id);
    this.userService.deleteUserBlog(userDto, blogId.id);
    return HttpStatus.ACCEPTED;
  }
}
