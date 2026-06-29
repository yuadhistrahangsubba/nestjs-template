import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, Repository } from 'typeorm';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../user.entity';

export class CreateUserCommand implements ICommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, UserEntity>
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserEntity> {
    const { dto } = command;

    try {
      // Validate required fields
      if (!dto.mobileNo) {
        throw new RpcException({
          statusCode: 400,
          message: 'Mobile number is a required field',
        });
      }

      // Check for existing user by CID and mobile in parallel (H5 fix)
      const [existingUserByCid, existingUserByMobile] = await Promise.all([
        this.userRepository.findOne({
          where: { identificationNo: dto.identificationNo },
        }),
        this.userRepository.findOne({
          where: { mobileNo: dto.mobileNo },
        }),
      ]);

      if (existingUserByCid) {
        // Return existing user instead of throwing error (idempotent creation)
        return existingUserByCid;
      }

      if (existingUserByMobile) {
        throw new RpcException({
          statusCode: 409,
          message: `User with mobile number ${dto.mobileNo} already exists`,
        });
      }

      const userEntity = this.userRepository.create({
        fullName: dto.fullName,
        identificationNo: dto.identificationNo,
        mobileNo: dto.mobileNo,
        roleType: dto.roleType,
        isActive: true,
      } as DeepPartial<UserEntity>);

      const savedUser = await this.userRepository.save(userEntity);

      return savedUser;
    } catch (error) {
      console.error('Error creating user at Admin Auth Service:', error);

      // Re-throw RpcException as-is
      if (error instanceof RpcException) {
        throw error;
      }

      // Handle database errors
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as { code: string; detail?: string };

        // PostgreSQL unique constraint violation
        if (dbError.code === '23505') {
          throw new RpcException({
            statusCode: 409,
            message: 'User with this email or mobile number already exists',
          });
        }

        // PostgreSQL foreign key violation
        if (dbError.code === '23503') {
          throw new RpcException({
            statusCode: 400,
            message:
              'Invalid reference: organization, dzongkhag, or gewog not found',
          });
        }
      }

      // Generic error
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to create user. Please try again.',
      });
    }
  }
}
