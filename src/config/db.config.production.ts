import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as path from 'path';

export default (): PostgresConnectionOptions => ({
  type: 'postgres',
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  username: process.env.PG_USER,
  host: process.env.PG_HOST,
  port: +process.env.PG_PORT,
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
  synchronize: false,
});
