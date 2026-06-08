import { type IQuery, type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageDto } from '../../../common/dto/page.dto';
import { AuditLogDto } from '../dto/audit-log.dto';
import { AuditLogPageOptionsDto } from '../dto/audit-log-page-options.dto';
import { AuditLogEntity } from '../entities/audit-log.entity';

export class GetAllAuditLogsQuery implements IQuery {
  constructor(public readonly pageOptionsDto: AuditLogPageOptionsDto) {}
}

@QueryHandler(GetAllAuditLogsQuery)
export class GetAllAuditLogsHandler
  implements IQueryHandler<GetAllAuditLogsQuery>
{
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async execute(query: GetAllAuditLogsQuery): Promise<PageDto<AuditLogDto>> {
    const { pageOptionsDto } = query;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      // Optimize: Select only needed columns instead of full entity
      .select([
        'auditLog.id',
        'auditLog.event',
        'auditLog.entityType',
        'auditLog.entityId',
        'auditLog.entityName',
        'auditLog.createdAt',
        'auditLog.updatedAt',
        'auditLog.createdById',
        'auditLog.createdByName',
        // Exclude 'data' field for list view - it's large JSON and rarely needed in list
      ]);

    // Text search on entity name
    if (pageOptionsDto.q) {
      queryBuilder.searchByString(pageOptionsDto.q, ['auditLog.entityName']);
    }

    // Filter by event type
    if (pageOptionsDto.event) {
      queryBuilder.andWhere('auditLog.event = :event', {
        event: pageOptionsDto.event,
      });
    }

    // Filter by entity type
    if (pageOptionsDto.entityType) {
      queryBuilder.andWhere('auditLog.entityType = :entityType', {
        entityType: pageOptionsDto.entityType,
      });
    }

    // Filter by user who created the log
    if (pageOptionsDto.createdById) {
      queryBuilder.andWhere('auditLog.createdById = :createdById', {
        createdById: pageOptionsDto.createdById,
      });
    }

    // Date range filter (optimized with indexed column)
    if (pageOptionsDto.dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', {
        dateFrom: new Date(pageOptionsDto.dateFrom),
      });
    }

    if (pageOptionsDto.dateTo) {
      // Add 1 day to include the entire end date
      const endDate = new Date(pageOptionsDto.dateTo);
      endDate.setDate(endDate.getDate() + 1);
      queryBuilder.andWhere('auditLog.createdAt < :dateTo', {
        dateTo: endDate,
      });
    }

    // Ordering (default to createdAt DESC for most recent first)
    queryBuilder.orderBy(
      pageOptionsDto.orderBy
        ? `auditLog.${pageOptionsDto.orderBy}`
        : 'auditLog.createdAt',
      pageOptionsDto.order,
    );

    // Paginate with optimized count query
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }
}

/**
 * Optimized query for getting total count without loading data
 * Used for badge counts in the dashboard
 */
export class GetAuditLogCountQuery implements IQuery {
  constructor(
    public readonly filters?: {
      event?: string;
      entityType?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {}
}

@QueryHandler(GetAuditLogCountQuery)
export class GetAuditLogCountHandler
  implements IQueryHandler<GetAuditLogCountQuery>
{
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async execute(query: GetAuditLogCountQuery): Promise<number> {
    const { filters } = query;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .select('COUNT(*)', 'count');

    if (filters?.event) {
      queryBuilder.andWhere('auditLog.event = :event', {
        event: filters.event,
      });
    }

    if (filters?.entityType) {
      queryBuilder.andWhere('auditLog.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters?.dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', {
        dateFrom: new Date(filters.dateFrom),
      });
    }

    if (filters?.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setDate(endDate.getDate() + 1);
      queryBuilder.andWhere('auditLog.createdAt < :dateTo', {
        dateTo: endDate,
      });
    }

    const result = await queryBuilder.getRawOne<{ count: string }>();

    return Number.parseInt(result?.count ?? '0', 10);
  }
}

/**
 * Query to get distinct entity types for filter dropdown
 */
export class GetDistinctEntityTypesQuery implements IQuery {}

@QueryHandler(GetDistinctEntityTypesQuery)
export class GetDistinctEntityTypesHandler
  implements IQueryHandler<GetDistinctEntityTypesQuery>
{
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async execute(): Promise<string[]> {
    const result = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .select('DISTINCT auditLog.entityType', 'entityType')
      .where('auditLog.entityType IS NOT NULL')
      .orderBy('auditLog.entityType', 'ASC')
      .getRawMany<{ entityType: string }>();

    return result.map((r) => r.entityType);
  }
}
