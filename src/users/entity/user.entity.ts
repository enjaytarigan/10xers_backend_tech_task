import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ name: 'id', type: 'integer' })
  id: number;

  @Column({ name: 'fullname', type: 'varchar', length: '50' })
  fullname: string;

  @Column({ name: 'email', type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ name: 'password', type: 'char', length: 72 })
  password: string;
}
