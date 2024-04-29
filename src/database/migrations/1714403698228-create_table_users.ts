import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsers1714403698228 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            fullname VARCHAR(50) NOT NULL,
            email VARCHAR(50) NOT NULL UNIQUE,
            password CHAR(72) NOT NULL
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
