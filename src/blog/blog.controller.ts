import { Body, Controller, Get, Post } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CategoryCreateDto } from './dtos/create-category.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('/createCategory')
  createCategory(@Body() categoryDto: CategoryCreateDto) {
    return this.blogService.createCategory(categoryDto);
  }

  @Get()
  getAllBlogs() {
    return this.blogService.getAllBlogsWithLightUsers();
  }

  @Get('/latestBlogs')
  getLatestBlogs() {
    return this.blogService.getLatestBlogs();
  }
}
