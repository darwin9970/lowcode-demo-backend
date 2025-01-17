import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../modules/role/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DataInitService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.initRoles();
    await this.initUsers();
  }

  private async initRoles() {
    const existingRoles = await this.roleRepository.find();
    if (existingRoles.length === 0) {
      const adminRole = this.roleRepository.create({
        name: 'admin',
        permissions: ['*'],
      });
      await this.roleRepository.save(adminRole);
    }
  }

  private async initUsers() {
    const existingUsers = await this.userRepository.find();
    if (existingUsers.length === 0) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      if (adminRole) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = this.userRepository.create({
          username: 'admin',
          password: hashedPassword,
          isActive: true,
          roles: [adminRole],
        });
        await this.userRepository.save(adminUser);
      }
    }
  }
} 