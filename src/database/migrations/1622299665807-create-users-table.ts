import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1622299665807 implements MigrationInterface {
  name = 'createUsersTable1622299665807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pg_trgm for GIN-based ILIKE / regex search on text columns
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(
      "CREATE TYPE \"users_role_enum\" AS ENUM('USER', 'ADMIN')",
    );
    await queryRunner.query(`
      CREATE TABLE "users"
      (
        "id"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"        TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMP         NOT NULL DEFAULT now(),
        "full_name"         character varying NOT NULL,
        "role"              "users_role_enum" NOT NULL DEFAULT 'USER',
        "identification_no" character varying NOT NULL,
        "password"          character varying NOT NULL,
        "mobile_no"         character varying,
        "avatar"            character varying,
        "is_active"         boolean                    DEFAULT true,
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )`);

    // B-tree indexes for common WHERE filter columns
    await queryRunner.query(`CREATE INDEX idx_users_role ON users (role)`);
    await queryRunner.query(
      `CREATE INDEX idx_users_is_active ON users (is_active)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_users_mobile_no ON users (mobile_no)`,
    );

    // Composite index — most list queries filter by both is_active and role
    await queryRunner.query(
      `CREATE INDEX idx_users_is_active_role ON users (is_active, role)`,
    );

    // Partial index — only active users, lighter than the full composite index
    await queryRunner.query(
      `CREATE INDEX idx_users_active_role ON users (role) WHERE is_active = true`,
    );

    // GIN trigram index — accelerates ILIKE '%...%' searches on full_name
    await queryRunner.query(
      `CREATE INDEX idx_users_full_name_trgm ON users USING GIN (full_name gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_full_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_active_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_mobile_no`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role`);
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "users_role_enum"');
  }
}
