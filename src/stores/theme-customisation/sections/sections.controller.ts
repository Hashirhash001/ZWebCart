import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dtos/create-section.dto';
import { UpdateSectionDto } from './dtos/update-section.dto';
import { AdminGuard } from 'src/stores/guards/admin.guard';
import { Request } from 'express';

@Controller('/store/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('create')
  @UseGuards(AdminGuard)
  async create(@Req() request: Request, @Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(request['storeDbUrl'], request['storeId'], createSectionDto);
  }

  @Get('all')
  @UseGuards(AdminGuard) // Fix: Ensure the request includes storeDbUrl
  async findAll(@Req() request: Request) {
    return this.sectionsService.findAll(request['storeDbUrl']);
  }

  @Get('theme/:themeId')
  @UseGuards(AdminGuard)
  async findByTheme(@Req() request: Request, @Param('themeId') themeId: string) {
    return this.sectionsService.findByTheme(request['storeDbUrl'], Number(themeId));
  }

  @Get('page/:pageId')
  @UseGuards(AdminGuard)
  async findByPage(@Req() request: Request, @Param('pageId') pageId: string) {
    return this.sectionsService.findByPage(request['storeDbUrl'], Number(pageId));
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(@Req() request: Request, @Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(request['storeDbUrl'], Number(id), updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Req() request: Request, @Param('id') id: string) {
    return this.sectionsService.delete(request['storeDbUrl'], Number(id));
  }
}
