import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const filePathPattern = path.join(
  'dist',
  'src',
  'modules',
  '**',
  '*.entity.js',
);
const fileCommonPattern = path.join('dist', 'src', '**', '*.entity.js');

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_HOSTNAME || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.PG_USERNAME || 'tenxers',
  password: process.env.PG_PASSWORD || 'tenxers',
  database: process.env.PG_DATABASE || 'tenxers',
  entities: [filePathPattern, fileCommonPattern],
  migrations: ['dist/src/database/migrations/*.js'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
