import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { AuditEvent } from '../constants/audit-event.enum';

export class AuditLogPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Filter by event type (CREATE, READ, UPDATE, DELETE)',
    enum: AuditEvent,
    enumName: 'AuditEvent',
  })
  @IsOptional()
  @IsEnum(AuditEvent)
  event?: AuditEvent;

  @ApiPropertyOptional({
    description: 'Filter by entity type (e.g., UserEntity, RoleEntity)',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID who performed the action',
  })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601 format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601 format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by dzongkhag ID (for organization-linked logs)',
  })
  @IsOptional()
  @IsString()
  dzongkhagId?: string;

  @ApiPropertyOptional({
    description: 'Filter by organization ID',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;
}
