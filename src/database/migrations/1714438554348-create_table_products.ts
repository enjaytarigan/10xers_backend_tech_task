import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableProducts1714438554348 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE products(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description VARCHAR(1000) NOT NULL,
      price numeric(10, 2) NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `);

    await queryRunner.query(`
        ALTER TABLE products
        ADD CONSTRAINT fk_created_by
        FOREIGN KEY (created_by) 
        REFERENCES users(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP TABLE products');
  }
}
