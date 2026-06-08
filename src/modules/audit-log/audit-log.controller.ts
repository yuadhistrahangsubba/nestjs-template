import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { PageDto } from '../../common/dto/page.dto';
import { AuditLogService } from './audit-log.service';
import { AuditEvent } from './constants/audit-event.enum';
import { AuditLogDto } from './dto/audit-log.dto';
import { AuditLogPageOptionsDto } from './dto/audit-log-page-options.dto';
import { AuditLogEntity } from './entities/audit-log.entity';

@Controller()
@ApiTags('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('audit-log/all')
  @ApiOperation({ summary: 'Get all audit logs with filtering and pagination' })
  @ApiOkResponse({
    description: 'Paginated list of audit logs',
    type: PageDto<AuditLogDto>,
  })
  findAll(
    @Query() pageOptionsDto: AuditLogPageOptionsDto,
  ): Promise<PageDto<AuditLogDto>> {
    return this.auditLogService.findAll(pageOptionsDto);
  }

  @Get('audit-log/count')
  @ApiOperation({ summary: 'Get total count of audit logs (optimized)' })
  @ApiOkResponse({ description: 'Total count of audit logs' })
  @ApiQuery({
    name: 'event',
    required: false,
    enum: AuditEvent,
    enumName: 'AuditEvent',
  })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async getCount(
    @Query('event') event?: AuditEvent,
    @Query('entityType') entityType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<{ count: number }> {
    const count = await this.auditLogService.getCount({
      event,
      entityType,
      dateFrom,
      dateTo,
    });

    return { count };
  }

  @Get('audit-log/entity-types')
  @ApiOperation({ summary: 'Get distinct entity types for filter dropdown' })
  @ApiOkResponse({ description: 'List of entity types' })
  async getEntityTypes(): Promise<{ entityTypes: string[] }> {
    const entityTypes = await this.auditLogService.getEntityTypes();

    return { entityTypes };
  }

  @Get('audit-log/:id')
  @ApiOperation({ summary: 'Get a single audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log UUID' })
  @ApiNotFoundResponse({ description: 'Audit Log not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: Uuid): Promise<AuditLogEntity> {
    return this.auditLogService.findOne(id);
  }
}
