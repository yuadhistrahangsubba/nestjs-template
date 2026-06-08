import * as typeorm from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators/use-dto.decorator';
import { AuditEvent } from '../constants/audit-event.enum';
import { AuditLogDto } from '../dto/audit-log.dto';

@typeorm.Entity({ name: 'audit_logs' })
@UseDto(AuditLogDto)
export class AuditLogEntity extends AbstractEntity<AuditLogDto> {
  @typeorm.Column({ type: 'enum', enum: AuditEvent })
  event!: AuditEvent;

  @typeorm.Column({ type: 'varchar', length: 100 })
  entityType!: string;

  @typeorm.Column({ type: 'uuid', nullable: true })
  entityId!: string | null;

  @typeorm.Column({ type: 'varchar', length: 150, nullable: true })
  entityName!: string | null;

  @typeorm.Column({ type: 'json', nullable: true })
  data!: Record<string, unknown> | null;

  @typeorm.Column({ type: 'uuid', nullable: true })
  createdById!: string | null;

  @typeorm.Column({ type: 'varchar', length: 150, nullable: true })
  createdByName!: string | null;
}

export { AuditEvent } from '../constants/audit-event.enum';
