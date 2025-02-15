"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoogleAuthDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_google_auth_dto_1 = require("./create-google-auth.dto");
class UpdateGoogleAuthDto extends (0, mapped_types_1.PartialType)(create_google_auth_dto_1.GoogleAuthDto) {
}
exports.UpdateGoogleAuthDto = UpdateGoogleAuthDto;
//# sourceMappingURL=update-google-auth.dto.js.map