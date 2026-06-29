/* eslint-disable  @typescript-eslint/no-unnecessary-condition */

import type {
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';

import { generateHash } from '../common/utils.ts';
import { UserEntity } from '../modules/user/user.entity.ts';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  async beforeInsert(event: InsertEvent<UserEntity>): Promise<void> {
    if (event.entity.password) {
      event.entity.password = await generateHash(event.entity.password);
    }
  }

  async beforeUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
    const entity = event.entity as UserEntity;

    if (entity.password && entity.password !== event.databaseEntity?.password) {
      entity.password = await generateHash(entity.password);
    }
  }
}
