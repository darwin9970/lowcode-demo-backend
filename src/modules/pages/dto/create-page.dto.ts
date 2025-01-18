import { IsString, IsOptional, IsArray, ValidateNested, IsObject, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ComponentPropsDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsObject()
  labelCol?: { span: number };

  @IsOptional()
  @IsObject()
  wrapperCol?: { span: number };

  @IsOptional()
  @IsArray()
  options?: Array<{ label: string; value: any }>;

  @IsOptional()
  @IsString()
  children?: string;

  @IsOptional()
  @IsObject()
  style?: Record<string, any>;

  @IsOptional()
  @IsObject()
  props?: Record<string, any>;
}

export class ComponentDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @ValidateNested()
  @Type(() => ComponentPropsDto)
  props: ComponentPropsDto;
}

export class CreatePageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentDto)
  components: ComponentDto[];
} 