import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/users/entity/user.entity';
import Response from 'superagent/lib/node/response';
import { ProductEntity } from '../src/products/entity/product.entity';

async function cleanupDatabase(dataSource: DataSource) {
  await dataSource.createQueryBuilder().delete().from(UserEntity).execute();
  await dataSource.createQueryBuilder().delete().from(ProductEntity).execute();
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    dataSource = app.get(DataSource);
    cleanupDatabase(dataSource);
    await app.init();
  });

  afterAll(async () => {
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ProductEntity)
      .execute();
    await dataSource.createQueryBuilder().delete().from(UserEntity).execute();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('POST /users/register', () => {
    beforeEach(async () => {
      await dataSource.createQueryBuilder().delete().from(UserEntity).execute();
    });

    it('should response 201 status code', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'backend@10xersmock.com',
          fullname: 'johndoe',
          password: '10xersstrongpassword',
        })
        .expect(201);
    });

    it('should response 409 status code', async () => {
      await request(app.getHttpServer()).post('/users/register').send({
        email: 'backend2@10xersmock.com',
        fullname: 'johndoe',
        password: '10xersstrongpassword',
      });

      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'backend2@10xersmock.com',
          fullname: 'johndoe',
          password: '10xersstrongpassword',
        })
        .expect(409);
    });

    it('should response 400 status code', async () => {
      let response: Response;

      response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'backend2@10xersmock.com',
          fullname: 'jo', // fullname too short
          password: '10xersstrongpassword',
        });

      expect(response.statusCode).toBe(400);

      response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'backend2@10xersmock.com',
          fullname: 'john doe',
          password: 'weak', // password too weak
        });
      expect(response.statusCode).toBe(400);

      response = await request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: 'invalidemail', // invalid email
          fullname: 'john doe',
          password: 'weakweakweak', // password too weak
        });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /users/login', () => {
    const dummyUser = {
      email: 'tenxersbe@tenxersbe.com',
      password: 'superstrong',
      fullname: 'john doe',
    };

    beforeEach(async () => {
      await dataSource.createQueryBuilder().delete().from(UserEntity).execute();

      await request(app.getHttpServer())
        .post('/users/register')
        .send(dummyUser);
    });

    it('should response 200 status code', async () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({ email: dummyUser.email, password: dummyUser.password })
        .expect(200);
    });

    it('should response 401 status code', async () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({ email: dummyUser.email, password: 'randompasswword' })
        .expect(401);
    });

    it('should response 404 status code', async () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'random@email.com', password: 'randompasswword' })
        .expect(404);
    });
  });

  describe('Manage Products', () => {
    const adminUser = {
      fullname: 'adminhandsome',
      password: 'adminstrong',
      email: 'admin@10xersbackend.com',
      accessToken: '',
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/users/register')
        .send(adminUser);

      await request(app.getHttpServer())
        .post('/users/login')
        .send({ email: adminUser.email, password: adminUser.password })
        .then((res) => {
          adminUser.accessToken = res.body.data.accessToken;
        });
    });

    beforeEach(async () => {
      await dataSource
        .createQueryBuilder()
        .delete()
        .from(ProductEntity)
        .execute();
    });

    describe('POST /products', () => {
      it('should response 201 status code', async () => {
        return request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.CREATED)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.data).toBeDefined();
            expect(res.body.data.productId).toBeDefined();
          });
      });

      it('should response 400 status code', async () => {
        await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.BAD_REQUEST);

        await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Aww', // bad title
            slug: 'aww-awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.BAD_REQUEST);

        await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // duplcate slug
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('GET /products/:productId', () => {
      it('should response 200 status code', async () => {
        const product = {
          title: 'Awesome New Product',
          slug: 'awesome-new-product', // Generated based on title
          description:
            "This is a fantastic product that you'll absolutely love!",
          price: 19.99,
        };

        const res = await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send(product)
          .expect(HttpStatus.CREATED);

        return request(app.getHttpServer())
          .get(`/products/${res.body.data.productId}`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(200)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.data).toBeDefined();
            expect(res.body.data.title).toEqual(product.title);
            expect(res.body.data.price).toEqual(product.price);
            expect(res.body.data.slug).toEqual(product.slug);
            expect(res.body.data.description).toEqual(product.description);
          });
      });

      it('should response 404 status code', async () => {
        await request(app.getHttpServer())
          .get(`/products/invalidid`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(404);

        return request(app.getHttpServer())
          .get(`/products/00000`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(404);
      });
    });

    describe('PUT products/:productId', () => {
      it('should response 200 status code', async () => {
        const res = await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.CREATED);

        const editPayload = {
          title: 'Awesome New Product-Edited',
          slug: 'awesome-new-product-edited', // Generated based on title
          description:
            "This is a fantastic product that you'll absolutely love!",
          price: 29.99,
        };

        return request(app.getHttpServer())
          .put(`/products/${res.body.data.productId}`)
          .send(editPayload)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(200)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.data).toBeDefined();
            expect(res.body.data.title).toEqual(editPayload.title);
            expect(res.body.data.price).toEqual(editPayload.price);
            expect(res.body.data.slug).toEqual(editPayload.slug);
            expect(res.body.data.description).toEqual(editPayload.description);
          });
      });

      it('should response 400 status code with "slug already used" message', async () => {
        const product1 = {
          title: 'Awesome New Product',
          slug: 'awesome-new-product-unique', // Generated based on title
          description:
            "This is a fantastic product that you'll absolutely love!",
          price: 19.99,
        };

        await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send(product1)
          .expect(HttpStatus.CREATED);

        const product2 = {
          title: 'Awesome New Product-2',
          slug: 'awesome-new-product-2', // Generated based on title
          description:
            "This is a fantastic product that you'll absolutely love!",
          price: 19.99,
        };

        const res = await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send(product2)
          .expect(HttpStatus.CREATED);

        const editPayload = {
          title: 'Awesome New Product',
          slug: 'awesome-new-product-unique', // Generated based on title
          description:
            "This is a fantastic product that you'll absolutely love!",
          price: 19.99,
        };

        return request(app.getHttpServer())
          .put(`/products/${res.body.data.productId}`)
          .send(editPayload)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toEqual('slug already used');
          });
      });

      it('should response 404 status code', () => {
        const editPayload = {
          title: 'Awesome New Product-Edited',
          slug: 'awesome-new-product-edited', // Generated based on title
          description:
            "This is a fantastic product that you'll absolutely love!",
          price: 29.99,
        };

        return request(app.getHttpServer())
          .put(`/products/000`)
          .send(editPayload)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('DELETE /products/:productId', () => {
      it('should response 401 status code', () => {
        return request(app.getHttpServer())
          .delete(`/products/25`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should response 200 status code with "product deleted successfully"', async () => {
        const res = await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.CREATED);

        return request(app.getHttpServer())
          .delete(`/products/${res.body.data.productId}`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(200)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toEqual('product deleted successfully');
          });
      });

      it('should response 404 status code with "product not found"', async () => {
        return request(app.getHttpServer())
          .delete(`/products/9999`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(HttpStatus.NOT_FOUND)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toEqual('product not found');
          });
      });
    });

    describe('GET /products', () => {
      it('should response 200 status code', () => {
        return request(app.getHttpServer())
          .get(`/products`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(200)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.data).toBeDefined();
            expect(res.body.data).toHaveLength(0);
          });
      });

      it('should response 200 status code and return searched product', async () => {
        await request(app.getHttpServer())
          .post('/products')
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .send({
            title: 'Awesome New Product',
            slug: 'awesome-new-product', // Generated based on title
            description:
              "This is a fantastic product that you'll absolutely love!",
            price: 19.99,
          })
          .expect(HttpStatus.CREATED);

        return request(app.getHttpServer())
          .get(`/products?search=awesome`)
          .set('authorization', `Bearer ${adminUser.accessToken}`)
          .expect(200)
          .then((res) => {
            expect(res.body.message).toBeDefined();
            expect(res.body.data).toBeDefined();
            expect(res.body.data).toHaveLength(1);
          });
      });
    });
  });
});
