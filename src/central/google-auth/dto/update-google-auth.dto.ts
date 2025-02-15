import { PartialType } from '@nestjs/mapped-types';
import { GoogleAuthDto } from './create-google-auth.dto';

export class UpdateGoogleAuthDto extends PartialType(GoogleAuthDto) {}
