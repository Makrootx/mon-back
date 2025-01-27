import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Blog } from './schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.shema';
import { BlogCreateDto } from './dtos/create-blog.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { CategoryCreateDto } from './dtos/create-category.dto';
import { BlogUpdateDto } from './dtos/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createBlogModelForUser(user: UserDocument, blogDto: BlogCreateDto) {
    const category = await this.categoryModel
      .findOne({ name: blogDto.categoryName })
      .exec();
    if (!category)
      throw new HttpException(
        `Category with given name doesn't exist.`,
        HttpStatus.BAD_REQUEST,
      );

    const blog = new this.blogModel({
      title: blogDto.title,
      content: blogDto.content,
      category: category,
      user: user._id,
    });

    return blog;
  }

  async createCategory(categoryDto: CategoryCreateDto) {
    const categoryExisting = await this.categoryModel
      .findOne({ name: categoryDto.name })
      .exec();
    if (categoryExisting)
      throw new HttpException(
        `Category with given name is already existing.`,
        HttpStatus.BAD_REQUEST,
      );
    const category = new this.categoryModel({ ...categoryDto });
    return category.save();
  }

  async getAllBlogsWithLightUsers() {
    return this.blogModel
      .find()
      .populate({ path: 'user', select: '-blog' })
      .exec();
  }

  async getLatestBlogs() {
    return this.blogModel
      .find({}, {}, { sort: '-lastModified', limit: 10 })
      .exec();
  }

  async getUserBlogs(userId: string) {
    return await this.blogModel.find({ user: userId }).exec();
  }

  async updateUserBlog(blogDto: BlogUpdateDto) {
    const category = await this.categoryModel
      .findOne({ name: blogDto.categoryName })
      .exec();
    if (!category)
      new HttpException(
        `Category with given name wasn't found`,
        HttpStatus.BAD_REQUEST,
      );
    return await this.blogModel
      .findOneAndUpdate(
        { _id: blogDto.id },
        { ...blogDto, category: category._id },
        { new: true },
      )
      .exec();
  }

  deleteBlogByUser(blogId: string) {
    return this.blogModel.findByIdAndDelete(blogId).exec();
  }
}
