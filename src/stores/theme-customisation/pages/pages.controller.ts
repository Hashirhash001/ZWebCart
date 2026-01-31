import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dtos/create-page.dto';
import { UpdatePageDto } from './dtos/update-page.dto';
import { AdminGuard } from 'src/stores/guards/admin.guard';
import { AddSectionsToPageDto } from './dtos/add-sections-to-page.dto';

@Controller('store/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @UseGuards(AdminGuard)
  @Post('create')
  async create(@Req() request, @Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(request['storeDbUrl'], createPageDto);
  }

  @UseGuards(AdminGuard)
  @Patch(':pageId/sections')
  async addSectionsToPage(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Body() data: AddSectionsToPageDto,
    @Req() req: Request
  ) {
    const storeDbUrl = req['storeDbUrl']; // Store-specific database URL
    return this.pagesService.addSectionsToPage(storeDbUrl, pageId, data);
  }

  @UseGuards(AdminGuard)
  @Get('all')
  async findAll(@Req() request) {
    return this.pagesService.findAll(request['storeDbUrl']);
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  async findOne(@Req() request, @Param('id') id: string) {
    return this.pagesService.findOne(request['storeDbUrl'], Number(id));
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Req() request, @Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(request['storeDbUrl'], Number(id), updatePageDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Req() request, @Param('id') id: string) {
    return this.pagesService.delete(request['storeDbUrl'], Number(id));
  }
}