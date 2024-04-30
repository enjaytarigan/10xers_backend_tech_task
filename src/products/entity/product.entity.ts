import { UserEntity } from '../../users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { DecimalColumnTransformer } from '../../common/transformer';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'slug', type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'description', type: 'varchar', length: 1000 })
  description: string;

  @Column({
    name: 'price',
    type: 'numeric',
    transformer: new DecimalColumnTransformer(),
  })
  price: number;

  @Column({ name: 'created_by', type: 'integer' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'created_by',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_created_by',
  })
  userCreatedBy: UserEntity;

  update(product: Partial<ProductEntity>) {
    for (const property in product) {
      if (product[property] != null) {
        this[property] = product[property];
      }
    }
  }
}
