"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./stores/auth/auth.module");
const order_module_1 = require("./stores/order/order.module");
const category_module_1 = require("./stores/category/category.module");
const store_auth_module_1 = require("./central/store-auth/store-auth.module");
const products_module_1 = require("./stores/products/products.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const cart_module_1 = require("./stores/cart/cart.module");
const wishlist_module_1 = require("./stores/wishlist/wishlist.module");
const collections_module_1 = require("./stores/collections/collections.module");
const themes_module_1 = require("./stores/theme-customisation/themes/themes.module");
const pages_module_1 = require("./stores/theme-customisation/pages/pages.module");
const sections_module_1 = require("./stores/theme-customisation/sections/sections.module");
const google_auth_module_1 = require("./central/google-auth/google-auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            order_module_1.OrderModule,
            category_module_1.CategoryModule,
            store_auth_module_1.StoreAuthModule,
            products_module_1.ProductsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            cart_module_1.CartModule,
            wishlist_module_1.WishlistModule,
            collections_module_1.CollectionsModule,
            themes_module_1.ThemesModule,
            pages_module_1.PagesModule,
            sections_module_1.SectionsModule,
            google_auth_module_1.GoogleAuthModule
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map