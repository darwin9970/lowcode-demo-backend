import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { PageVersion } from './entities/page-version.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ComponentDto } from './dto/create-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageVersion)
    private readonly pageVersionRepository: Repository<PageVersion>,
  ) {}

  async create(createPageDto: CreatePageDto, userId: string) {

    console.log('Received create request:', JSON.stringify(createPageDto));
    // 验证组件数据的合法性
    this.validateComponents(createPageDto.components);

    const page = this.pageRepository.create({
      ...createPageDto,
      version: 1,
      creatorId: userId,
      publishStatus: 'unpublished',
      createTime: new Date(),
      updateTime: new Date(),
    });

    // 保存页面
    const savedPage = await this.pageRepository.save(page);

    // 创建第一个版本
    await this.createVersion(savedPage, userId);

    return savedPage;
  }

  private validateComponents(components: ComponentDto[]) {
    // 验证组件的父子关系是否正确
    const componentMap = new Map(components.map(c => [c.id, c]));
    
    // 记录每个父组件下的子组件顺序
    const orderMap = new Map<string, number[]>();
    
    for (const component of components) {
      // 验证组件类型
      if (!this.isValidComponentType(component.type)) {
        throw new BadRequestException(`Invalid component type: ${component.type}`);
      }

      // 验证父子关系
      if (component.parentId) {
        const parent = componentMap.get(component.parentId);
        if (!parent) {
          throw new BadRequestException(`Parent component ${component.parentId} not found`);
        }
        
        // 检查父组件是否允许包含子组件
        if (!this.canHaveChildren(parent.type)) {
          throw new BadRequestException(`Component type ${parent.type} cannot have children`);
        }

        // 记录父组件下的子组件顺序
        const parentOrders = orderMap.get(component.parentId) || [];
        parentOrders.push(component.order);
        orderMap.set(component.parentId, parentOrders);
      }

      // 验证组件属性
      this.validateComponentProps(component);
    }

    // 验证每个父组件下子组件的顺序是否正确
    for (const [parentId, orders] of orderMap.entries()) {
      if (new Set(orders).size !== orders.length) {
        throw new BadRequestException(`Duplicate orders under parent component ${parentId}`);
      }
    }
  }

  private isValidComponentType(type: string): boolean {
    const validTypes = [
      'Button', 'Input', 'Form', 'Table', 'Card', 
      'Select', 'DatePicker', 'Switch', 'Radio', 
      'Checkbox', 'TextArea', 'InputNumber'
    ];
    return validTypes.includes(type);
  }

  private canHaveChildren(type: string): boolean {
    // 定义哪些组件可以包含子组件
    const containerTypes = ['Form', 'Card'];
    return containerTypes.includes(type);
  }

  private validateComponentProps(component: ComponentDto) {
    // 验证表单字段的特殊属性
    if (['Input', 'Select', 'DatePicker', 'Radio', 'Checkbox', 'InputNumber'].includes(component.type)) {
      if (component.props.labelCol && typeof component.props.labelCol?.span !== 'number') {
        throw new BadRequestException(`Invalid labelCol for component ${component.id}`);
      }
      if (component.props.wrapperCol && typeof component.props.wrapperCol?.span !== 'number') {
        throw new BadRequestException(`Invalid wrapperCol for component ${component.id}`);
      }
    }

    // 验证特定组件的必需属性
    switch (component.type) {
      case 'Select':
      case 'Radio':
        if (component.props.options && !Array.isArray(component.props.options)) {
          throw new BadRequestException(`Options must be an array for ${component.type} component ${component.id}`);
        }
        break;
      case 'Button':
        if (component.props.children && typeof component.props.children !== 'string') {
          throw new BadRequestException(`Button text must be a string for component ${component.id}`);
        }
        break;
    }
  }

  async findAll(userId: string) {
    return this.pageRepository.find({
      where: { creatorId: userId },
      order: { updateTime: 'DESC' },
    });
  }

  async findOne(id: string) {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page #${id} not found`);
    }
    return page;
  }

  async update(id: string, updatePageDto: UpdatePageDto, userId: string) {
    const page = await this.findOne(id);
    
    // 验证权限
    if (page.creatorId !== userId) {
      throw new ForbiddenException('No permission to update this page');
    }

    // 验证组件数据
    if (updatePageDto.components) {
      this.validateComponents(updatePageDto.components);
    }
    
    // 更新版本号
    page.version += 1;
    page.updateTime = new Date();
    
    // 合并更新
    Object.assign(page, updatePageDto);
    
    // 保存更新
    const updatedPage = await this.pageRepository.save(page);
    
    // 创建新版本
    await this.createVersion(updatedPage, userId);

    return updatedPage;
  }

  async remove(id: string) {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
  }

  private async createVersion(page: Page, userId: string) {
    const version = this.pageVersionRepository.create({
      pageId: page.id,
      version: page.version,
      components: page.components,
      creatorId: userId,
    });
    return this.pageVersionRepository.save(version);
  }

  async getVersions(pageId: string) {
    return this.pageVersionRepository.find({
      where: { pageId },
      order: { version: 'DESC' },
    });
  }

  async rollbackVersion(pageId: string, version: number, userId: string) {
    const pageVersion = await this.pageVersionRepository.findOne({
      where: { pageId, version },
    });
    if (!pageVersion) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    const page = await this.findOne(pageId);
    page.version += 1;
    page.components = pageVersion.components;
    await this.pageRepository.save(page);

    // 创建新版本
    await this.createVersion(page, userId);

    return page;
  }

  async publish(id: string) {
    const page = await this.findOne(id);
    page.publishStatus = 'published';
    return this.pageRepository.save(page);
  }

  async unpublish(id: string) {
    const page = await this.findOne(id);
    page.publishStatus = 'unpublished';
    return this.pageRepository.save(page);
  }
} 