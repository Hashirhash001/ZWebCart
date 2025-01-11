import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { AdminGuard } from '../guards/admin.guard';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { FrontStoreGuard } from '../guards/frontStore.guard';
import { FilterProductDto } from './dtos/filter-product.dto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file
const MAX_FILE_COUNT = 10; // Limit to 10 files
const UPLOADS_DIR = './uploads'; // Directory where images will be stored

const multerConfig = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(
        new BadRequestException('Only image files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
};

@Controller('store/product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private async validateDto<T extends object>(
    dtoClass: new () => T,
    body: any,
  ): Promise<T> {
    const transformedDto = plainToInstance(dtoClass, body);
    const errors = await validate(transformedDto);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((err) => Object.values(err.constraints)).flat(),
      );
    }
    return transformedDto;
  }

  private parseAttributes(body: any): void {
    if (typeof body.attributes === 'string') {
      try {
        body.attributes = JSON.parse(body.attributes);
      } catch {
        throw new BadRequestException('Invalid JSON format for attributes');
      }
    }
  }

  @Post('/create')
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_FILE_COUNT, multerConfig))
  async createProduct(
    @Req() request: Request,
    @Body() body: any,
    @UploadedFiles() files: File[],
  ) {
    this.parseAttributes(body);
    const createProductDto = await this.validateDto(CreateProductDto, body);

    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const storeDbUrl = request['storeDbUrl'];
    return this.productsService.createProduct(
      storeDbUrl,
      createProductDto,
      files,
    );
  }

  @Put('/update/:id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_FILE_COUNT, multerConfig))
  async updateProduct(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: File[],
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid product ID');
    }

    this.parseAttributes(body);
    const updateProductDto = await this.validateDto(UpdateProductDto, body);

    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const storeDbUrl = request['storeDbUrl'];
    return this.productsService.updateProduct(
      storeDbUrl,
      parsedId,
      updateProductDto,
      files,
    );
  }

  @Get('/all')
  @UseGuards(FrontStoreGuard)
  async getAllProducts(@Req() request: Request) {
    const storeDbUrl = request['storeDbUrl'];
    return this.productsService.getProducts(storeDbUrl);
  }

  @Get(':id')
  @UseGuards(FrontStoreGuard)
  async getProduct(@Req() request: Request, @Param('id') id: string) {
    const storeDbUrl = request['storeDbUrl'];
    return this.productsService.getProduct(storeDbUrl, id);
  }

  @Delete(':id/delete')
  @UseGuards(AdminGuard)
  async deleteProduct(@Req() request: Request, @Param('id') id: string) {
    const storeDbUrl = request['storeDbUrl'];
    return this.productsService.deleteProduct(storeDbUrl, id);
  }

  //frontend
  @Get('/filter-by-category/:categoryId')
  @UseGuards(FrontStoreGuard)
  async fetchProductsByCategory(
    @Req() request: Request,
    @Param('categoryId') categoryId: string,
  ) {
    const storeDbUrl = request['storeDbUrl'];
    return this.productsService.filterProductsByCategory(storeDbUrl, categoryId);
  }

  @Post('/filter')
  @UseGuards(FrontStoreGuard)
  async filterProducts(
    @Body() filterDto: FilterProductDto,  // Use @Body to fetch data from request body
    @Req() request: Request,
  ) {
    const { minPrice, maxPrice, attributes } = filterDto;

    const storeDbUrl = request['storeDbUrl'];

    return this.productsService.filterProductsByPriceAndAttributes(storeDbUrl, minPrice, maxPrice, attributes);
  }

}
