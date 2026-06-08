import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import type { UserEntity } from '../user.entity.ts';
export class UserDto extends AbstractDto {
  @ApiProperty({ nullable: true })
  fullName?: string | null;

  @ApiProperty()
  identificationNo!: string;

  @ApiProperty({ enum: RoleType, enumName: 'RoleType' })
  roleType!: RoleType;

  @ApiProperty({ nullable: true })
  avatar?: string | null;

  @ApiProperty({ nullable: true })
  mobileNo?: string | null;

  @ApiProperty({ nullable: true })
  isActive!: boolean;

  constructor(entity: UserEntity) {
    super(entity);
    this.fullName = entity.fullName;
    this.identificationNo = entity.identificationNo;
    this.roleType = entity.roleType;
    this.avatar = entity.avatar;
    this.mobileNo = entity.mobileNo;
    this.isActive = entity.isActive;
  }
}
