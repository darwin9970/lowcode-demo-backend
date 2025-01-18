import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  create(@Body() createPageDto: CreatePageDto, @Request() req) {
    try {
      return this.pagesService.create(createPageDto, req.user.sub);
    } catch (error) {
      console.error('Create page error:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Request() req) {
    return this.pagesService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto, @Request() req) {
    console.log('Received update request:', JSON.stringify(updatePageDto, null, 2));
    try {
      return this.pagesService.update(id, updatePageDto, req.user.sub);
    } catch (error) {
      console.error('Update page error:', error);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.pagesService.getVersions(id);
  }

  @Post(':id/versions/:version/rollback')
  rollbackVersion(
    @Param('id') id: string,
    @Param('version') version: number,
    @Request() req,
  ) {
    return this.pagesService.rollbackVersion(id, version, req.user.sub);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.pagesService.publish(id);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.pagesService.unpublish(id);
  }
} 