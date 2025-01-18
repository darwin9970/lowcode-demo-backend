import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Page } from './page.entity';
import { User } from '../../user/entities/user.entity';

@Entity('page_versions')
export class PageVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Page)
  page: Page;

  @Column()
  pageId: string;

  @Column()
  version: number;

  @Column({ type: 'json' })
  components: any;

  @CreateDateColumn()
  createTime: Date;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  creatorId: string;
} 