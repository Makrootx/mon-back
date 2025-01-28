import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, Query, Types, ObjectId } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.shema';
import { BlogCreateDto } from './dtos/create-blog.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { CategoryCreateDto } from './dtos/create-category.dto';
import { BlogUpdateDto } from './dtos/update-blog.dto';

export type BlogQuery = Query<
  BlogDocument[] | BlogDocument,
  BlogDocument,
  {},
  Blog,
  undefined,
  {}
>;

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
      category: category._id,
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
    return this.propagateBlogWithLightUser(this.blogModel.find()).exec();
  }

  async getLatestBlogs() {
    return this.propagateBlogWithLightUser(
      this.blogModel.find({}, {}, { sort: '-lastModified', limit: 10 }),
    );
  }

  async getUserBlogs(userId: Types.ObjectId) {
    return await this.propagateBlogWithLightUser(
      this.blogModel.find({ user: userId }),
    );
  }

  async updateUserBlog(blogDto: BlogUpdateDto): Promise<BlogQuery> {
    const category = await this.categoryModel
      .findOne({ name: blogDto.categoryName })
      .exec();
    if (!category)
      new HttpException(
        `Category with given name wasn't found`,
        HttpStatus.BAD_REQUEST,
      );
    const blogQuery = this.blogModel.findOneAndUpdate(
      { _id: blogDto.id },
      { ...blogDto, category: category._id, lastModified: Date.now() },
      { new: true },
    );
    return blogQuery;
  }

  deleteBlogByUser(blogId: string) {
    return this.blogModel.findByIdAndDelete(blogId);
  }

  propagateBlogWithLightUser(
    blog: Query<
      BlogDocument[] | BlogDocument,
      BlogDocument,
      {},
      Blog,
      undefined,
      {}
    >,
  ) {
    return blog.populate('user category', '-blog -password');
  }

  async propagateBlogPromiseWithLightUser(
    blog: Promise<
      Query<BlogDocument[] | BlogDocument, BlogDocument, {}, Blog, 'find', {}>
    >,
  ): Promise<BlogDocument> {
    const resolvedBlog = await blog;
    return (resolvedBlog as any).populate('user category', '-blog -password');
  }

  getBlogById(blogId: string) {
    console.log('ello');
    return this.blogModel
      .findOne({ _id: blogId })
      .populate('user category', '-blog -password');
  }

  getCategories() {
    return this.categoryModel.find({});
  }
}
