import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity.ts';
import { RoleType } from '../../constants/role-type.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { UserDto } from './dtos/user.dto.ts';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ type: 'varchar' })
  fullName!: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  roleType!: RoleType;

  @Column({ type: 'varchar' })
  identificationNo!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ nullable: true, type: 'varchar' })
  mobileNo!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar!: string | null;

  @Column({ nullable: true, default: true })
  isActive!: boolean;
}
