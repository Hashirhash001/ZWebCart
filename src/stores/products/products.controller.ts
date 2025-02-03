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

  private parseAndValidateBody(body: any): void {
    // Convert numeric fields from string to number
    if (typeof body.price === 'string') {
      const parsedPrice = Number(body.price.replace(/,/g, ''));
      if (isNaN(parsedPrice)) {
        throw new BadRequestException('Invalid format: price must be a number');
      }
      body.price = parsedPrice;
    }

    if (typeof body.comparePrice === 'string') {
      const parsedComparePrice = Number(body.comparePrice.replace(/,/g, ''));
      if (isNaN(parsedComparePrice)) {
        throw new BadRequestException(
          'Invalid format: comparePrice must be a number',
        );
      }
      body.comparePrice = parsedComparePrice;
    }
  
    if (typeof body.categoryId === 'string') {
      const parsedCategoryId = Number(body.categoryId);
      if (isNaN(parsedCategoryId)) {
        throw new BadRequestException('Invalid format: categoryId must be a number');
      }
      body.categoryId = parsedCategoryId;
    }
  
    if (typeof body.stock === 'string') {
      const parsedStock = Number(body.stock);
      if (isNaN(parsedStock)) {
        throw new BadRequestException('Invalid format: stock must be a number');
      }
      body.stock = parsedStock;
    }
  
    // Convert attributes string to JSON and validate
    if (typeof body.attributes === 'string') {
      try {
        const parsedAttributes = JSON.parse(body.attributes);
  
        if (!Array.isArray(parsedAttributes)) {
          throw new BadRequestException('Attributes must be an array of objects');
        }
  
        parsedAttributes.forEach((attr, index) => {
          if (
            typeof attr !== 'object' ||
            !attr.hasOwnProperty('key') ||
            !attr.hasOwnProperty('value') ||
            typeof attr.key !== 'string' ||
            typeof attr.value !== 'string'
          ) {
            throw new BadRequestException(
              `Invalid attribute format at index ${index}. Each attribute must have "key" and "value" as strings.`,
            );
          }
        });
  
        body.attributes = parsedAttributes;
      } catch (error) {
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
    if (!body) {
      throw new BadRequestException('Request body is missing');
    }

    this.parseAndValidateBody(body);
    const createProductDto = await this.validateDto(CreateProductDto, body);
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    return this.productsService.createProduct(
      request['storeDbUrl'],
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

    this.parseAndValidateBody(body);
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
    return this.productsService.filterProductsByCategory(
      storeDbUrl,
      categoryId,
    );
  }

  @Post('/filter')
  @UseGuards(FrontStoreGuard)
  async filterProducts(
    @Body() filterDto: FilterProductDto, // Use @Body to fetch data from request body
    @Req() request: Request,
  ) {
    const { minPrice, maxPrice, attributes } = filterDto;

    const storeDbUrl = request['storeDbUrl'];

    return this.productsService.filterProductsByPriceAndAttributes(
      storeDbUrl,
      minPrice,
      maxPrice,
      attributes,
    );
  }
}
