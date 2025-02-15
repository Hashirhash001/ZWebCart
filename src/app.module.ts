import { Module } from '@nestjs/common';
import { AuthModule } from './stores/auth/auth.module';
import { OrderModule } from './stores/order/order.module';
import { CategoryModule } from './stores/category/category.module';
import { StoreAuthModule } from './central/store-auth/store-auth.module';
import { ProductsModule } from './stores/products/products.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CartModule } from './stores/cart/cart.module';
import { WishlistModule } from './stores/wishlist/wishlist.module';
import { CollectionsModule } from './stores/collections/collections.module';
import { ThemesModule } from './stores/theme-customisation/themes/themes.module';
import { PagesModule } from './stores/theme-customisation/pages/pages.module';
import { SectionsModule } from './stores/theme-customisation/sections/sections.module';
import { GoogleAuthModule } from './central/google-auth/google-auth.module';

@Module({
  imports: [
    AuthModule,
    OrderModule,
    CategoryModule,
    StoreAuthModule,
    ProductsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to the folder where images will be stored
      serveRoot: '/uploads', // URL prefix to access the images
    }),
    CartModule,
    WishlistModule,
    CollectionsModule,
    ThemesModule,
    PagesModule,
    SectionsModule,
    GoogleAuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
