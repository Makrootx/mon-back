import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import * as jwt from 'jsonwebtoken';
import { UserTokenDto } from './dtos/token-user.dto';
import { UserLoginDto } from './dtos/login-user.dto';
import { BlogCreateDto } from 'src/blog/dtos/create-blog.dto';
import { BlogService } from 'src/blog/blog.service';
import { Blog, BlogDocument } from 'src/blog/schemas/blog.schema';
import { BlogUpdateDto } from 'src/blog/dtos/update-blog.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly blogService: BlogService,
  ) {}

  async createNewUser(userDto: CreateUserDto) {
    await this.validateExisting(userDto);

    const user = new this.userModel({ ...userDto });
    this.userModel.find();
    const savedUser = await user.save();

    return this.generateAuthPayload(savedUser);
  }

  async loginUser(userDto: UserLoginDto) {
    const user = await this.findUserByEmail(userDto.email);
    await this.validateUserLogin(user, userDto.password);
    return this.generateAuthPayload(user);
  }

  private async validateUserLogin(user: UserDocument, passsword: string) {
    if (user.password !== passsword)
      throw new HttpException(
        `User password isn't correct.`,
        HttpStatus.BAD_REQUEST,
      );
  }

  async validateExisting(userDto: CreateUserDto) {
    const userCheck = await this.userModel
      .findOne({ email: userDto.email })
      .exec();
    if (userCheck) {
      throw new HttpException(
        'User with given email already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findUserByEmail(userEmail: string) {
    const user = await this.userModel.findOne({ email: userEmail }).exec();
    if (!user)
      throw new HttpException(
        `User with given email doesn't exists.`,
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }

  async findUserById(userId: string) {
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user)
      throw new HttpException(
        `User with given id doesn't exist`,
        HttpStatus.BAD_REQUEST,
      );
    return user;
  }

  private generateAuthPayload(user: UserDocument) {
    return { accessToken: this.generateAccessToken(user) };
  }

  private generateAccessToken(user: UserDocument) {
    const userPayload: UserTokenDto = { email: user.email, id: user.id };
    const accessToken = jwt.sign(userPayload, process.env.JWT_PASS);
    return accessToken;
  }

  async createBlog(userDto: UserTokenDto, blogDto: BlogCreateDto) {
    const user = await this.findUserById(userDto.id);
    const blog = await this.blogService.createBlogModelForUser(user, blogDto);
    const savedBlog = await blog.save();
    await this.userModel
      .findByIdAndUpdate(
        userDto.id,
        {
          $push: { blog: savedBlog._id },
        },
        { new: true },
      )
      .exec();
    return savedBlog.populate({ path: 'user', select: '-blog' });
  }

  async getUser(userDto: UserTokenDto) {
    const user = await this.userModel.findOne({ _id: userDto.id }).exec();
    return user;
  }

  async getUserWithBlogs(userDto: UserTokenDto) {
    const user = await this.userModel
      .findOne({ _id: userDto.id })
      .populate('blog')
      .select('-password')
      .exec();
    return user;
  }

  async getUserBlogs(user) {}

  async updateUserBlog(userDto: UserTokenDto, blogDto: BlogUpdateDto) {
    await this.validateOwningBlog(userDto.id, blogDto.id);
    const newBlog = await this.blogService.updateUserBlog(blogDto);
    return newBlog.populate({ path: 'user category', select: '-blog' });
  }

  private async validateOwningBlog(userId: string, blogId: string) {
    const user = await (await this.findUserById(userId)).populate('blog');
    const validateBlog = user.blog.some(
      (blog: BlogDocument) => blog._id.toString() == blogId,
    );
    if (!validateBlog)
      throw new HttpException(
        `You don't have permission to modifing that blog, rather it not created or you don't own it.`,
        HttpStatus.BAD_REQUEST,
      );
  }

  async deleteUserBlog(userDto: UserTokenDto, blogId: string) {
    await this.validateOwningBlog(userDto.id, blogId);
    await this.blogService.deleteBlogByUser(blogId);
    const user = await this.findUserById(userDto.id);
    await this.userModel
      .findByIdAndUpdate(userDto.id, {
        blog: user.blog.filter(
          (blog: BlogDocument) => blog._id.toString() != blogId,
        ),
      })
      .exec();
  }
}
