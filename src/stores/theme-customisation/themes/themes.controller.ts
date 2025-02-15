import { Controller, Post, Get, Put, Delete, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dtos/create-theme.dto';
import { UpdateThemeDto } from './dtos/update-theme.dto';
import { AdminGuard } from '../../guards/admin.guard';
import { Request } from 'express';

@Controller('store/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Post('/create')
  @UseGuards(AdminGuard)
  async createTheme(@Req() request: Request, @Body() body: CreateThemeDto) {
    return this.themesService.createTheme(request['storeDbUrl'], request['storeId'], body);
  }

  @Get('/all')
  @UseGuards(AdminGuard)
  async getAllThemes(@Req() request: Request) {
    return this.themesService.getThemes(request['storeDbUrl']);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async getTheme(@Req() request: Request, @Param('id') id: string) {
    return this.themesService.getTheme(request['storeDbUrl'], id);
  }

  @Put('/update/:id')
  @UseGuards(AdminGuard)
  async updateTheme(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: UpdateThemeDto
  ) {
    return this.themesService.updateTheme(request['storeDbUrl'], id, body);
  }

  @Delete(':id/delete')
  @UseGuards(AdminGuard)
  async deleteTheme(@Req() request: Request, @Param('id') id: string) {
    return this.themesService.deleteTheme(request['storeDbUrl'], id);
  }
}
