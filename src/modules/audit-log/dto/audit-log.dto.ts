import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { AuditEvent } from '../constants/audit-event.enum';
import { AuditLogEntity } from '../entities/audit-log.entity';

export class AuditLogDto extends AbstractDto {
  @ApiProperty({ enum: AuditEvent, enumName: 'AuditEvent' })
  event!: AuditEvent;

  @ApiProperty({ type: 'string', maxLength: 100 })
  entityType!: string;

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  entityId!: string | null;

  @ApiProperty({ type: 'string', maxLength: 150, required: false })
  entityName!: string | null;

  @ApiProperty({})
  data!: string;

  @ApiProperty({ type: 'string', format: 'uuid', required: false })
  createdById!: string | null;

  @ApiProperty({ type: 'string', maxLength: 150, required: false })
  createdByName!: string | null;

  constructor(entity: AuditLogEntity) {
    super(entity);
    this.event = entity.event;
    this.entityType = entity.entityType;
    this.entityId = entity.entityId;
    this.entityName = entity.entityName;
    this.data = entity.data ? JSON.stringify(entity.data) : '';
    this.createdById = entity.createdById;
    this.createdByName = entity.createdByName;
  }
}
