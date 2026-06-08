import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { RoleType } from '../../../constants/role-type';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsString()
  identificationNo!: string;

  @ApiProperty()
  @IsString()
  mobileNo!: string;

  @ApiProperty({
    enum: RoleType,
    enumName: 'RoleType',
    example: RoleType.ADMIN,
  })
  @IsEnum(RoleType, { message: 'roleType must be one of: ADMIN, USER' })
  roleType!: RoleType;
}
