import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../@types/auth/Auth';

@Entity('users')
export class UserEntity implements User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  username!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('simple-array', { default: 'user' })
  roles!: string[];
}
