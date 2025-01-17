import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'editor' })
  @IsString()
  name: string;

  @ApiProperty({ example: ['read', 'write'] })
  @IsArray()
  permissions: string[];
} 