/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Logger } from '@nestjs/common';
import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  type RemoveEvent,
  type UpdateEvent,
} from 'typeorm';

import { AuditEvent } from '../modules/audit-log/constants/audit-event.enum';
import { AuditLogEntity } from '../modules/audit-log/entities/audit-log.entity';
import { ContextProvider } from '../providers/context.provider';

interface IAuditableEntity {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
  listenTo(): typeof Object {
    return Object;
  }

  async afterInsert(event: InsertEvent<unknown>): Promise<void> {
    if (event.entity && !(event.entity instanceof AuditLogEntity)) {
      await this.saveAuditLog(event, AuditEvent.CREATE);
    }
  }

  async beforeUpdate(event: UpdateEvent<unknown>): Promise<void> {
    if (event.entity && !(event.entity instanceof AuditLogEntity)) {
      await this.saveAuditLog(event, AuditEvent.UPDATE);
    }
  }

  async beforeRemove(event: RemoveEvent<unknown>): Promise<void> {
    if (event.entity && !(event.entity instanceof AuditLogEntity)) {
      await this.saveAuditLog(event, AuditEvent.DELETE);
    }
  }

  private async saveAuditLog(
    event: InsertEvent<unknown> | UpdateEvent<unknown> | RemoveEvent<unknown>,
    action: AuditEvent,
  ): Promise<void> {
    const userData = ContextProvider.getAuthUser();

    if (!userData) {
      return;
    }

    const entityName = event.metadata.name;
    const systemEntities = ['AuditLogEntity', 'AuditTrailEntity'];

    if (systemEntities.includes(entityName)) {
      return;
    }

    try {
      const auditLog = new AuditLogEntity();
      const entity = event.entity as IAuditableEntity | undefined;
      const databaseEntity = (event as UpdateEvent<unknown>).databaseEntity as
        | IAuditableEntity
        | undefined;

      const entityId = entity?.id ?? databaseEntity?.id ?? 'unknown';
      /*
       *   const entityDisplayName =
       *     entity?.name ??
       *     databaseEntity?.name ??
       *     `${event.metadata.tableName}#${entityId}`;
       */

      auditLog.event = action;
      auditLog.entityType = entityName;
      auditLog.entityId = entityId;
      auditLog.entityName = entityName;
      auditLog.data = { ...(entity ?? databaseEntity) };
      auditLog.createdById = userData?.id ?? null;
      auditLog.createdByName = userData?.fullName ?? null;

      await event.manager.save(auditLog);

      Logger.log(
        `Saved ${action} audit log for ${event.metadata.tableName}`,
        'Admin Auth Service Audit Log Subscriber',
      );
    } catch (error) {
      Logger.error(
        `Failed to save ${action} audit log for ${event.metadata.tableName}`,
        error instanceof Error ? error.message : 'Unknown error',
        'Admin Auth Service Audit Log Subscriber',
      );
    }
  }
}
