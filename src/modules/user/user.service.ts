import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import type { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';
import { CreateUserCommand } from './commands/create-user.command.ts';
import type { CreateUserDto } from './dtos/create-user.dto.ts';
import type { UserDto } from './dtos/user.dto.ts';
import type { UsersPageOptionsDto } from './dtos/users-page-options.dto.ts';
import { UserEntity } from './user.entity.ts';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private commandBus: CommandBus,
  ) {}

  // Find single user
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  @Transactional()
  createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.commandBus.execute<CreateUserCommand, UserEntity>(
      new CreateUserCommand(createUserDto),
    );
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (pageOptionsDto.q) {
      queryBuilder.searchByString(pageOptionsDto.q, ['firstName', 'email']);
    }

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.id = :userId', { userId });

    const userEntity = await queryBuilder.getOne();

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity.toDto();
  }
}
