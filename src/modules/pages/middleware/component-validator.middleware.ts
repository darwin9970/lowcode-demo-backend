import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ComponentDto } from '../dto/create-page.dto';

@Injectable()
export class ComponentValidatorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body.components) {
      this.validateComponents(req.body.components);
    }
    next();
  }

  private validateComponents(components: ComponentDto[]) {
    // 验证组件类型是否合法
    const validTypes = ['Button', 'Input', 'Form', 'Table', 'Card', 'Select', 'DatePicker', 'Switch', 'Radio', 'Checkbox'];
    
    for (const component of components) {
      if (!validTypes.includes(component.type)) {
        throw new BadRequestException(`Invalid component type: ${component.type}`);
      }
    }
  }
} 