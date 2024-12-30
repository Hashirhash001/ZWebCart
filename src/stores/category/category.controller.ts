import { Controller, Post, Body, Delete, Get, UseGuards, Req, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { AdminGuard } from '../guards/admin.guard';
import { Request } from 'express';

@Controller('store/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/create')
  @UseGuards(AdminGuard)
  async createCategory(@Req() request: Request, @Body() createCategoryDto: CreateCategoryDto) {
    const storeDbUrl = request['storeDbUrl']; // Retrieve storeDbUrl from the request
    return this.categoryService.createCategory(storeDbUrl, createCategoryDto);
  }

  @Get('/hierarchy')
  @UseGuards(AdminGuard)
  async getCategoryHierarchy(@Req() request: Request) {
    const storeDbUrl = request['storeDbUrl']; // Retrieve storeDbUrl from the request
    return this.categoryService.getCategoryHierarchy(storeDbUrl);
  }

  @Delete(':categoryId')
  @UseGuards(AdminGuard)
  async deleteCategory(@Req() request: Request, @Param('categoryId') categoryId: number) {
    const storeDbUrl = request['storeDbUrl']; // Retrieve storeDbUrl from the request
    return this.categoryService.deleteCategory(storeDbUrl, categoryId);
  }
}
