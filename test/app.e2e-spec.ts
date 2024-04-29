import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/users/entity/user.entity';
import Response from 'superagent/lib/node/response';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSoruce: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    dataSoruce = app.get(DataSource);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('POST /users/register', () => {
    beforeEach(async () => {
      await dataSoruce.createQueryBuilder().delete().from(UserEntity).execute();
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

    afterAll(async () => {
      await dataSoruce.createQueryBuilder().delete().from(UserEntity).execute();
    });
  });

  describe('POST /users/login', () => {
    const dummyUser = {
      email: 'tenxersbe@tenxersbe.com',
      password: 'superstrong',
      fullname: 'john doe',
    };

    beforeEach(async () => {
      await dataSoruce.createQueryBuilder().delete().from(UserEntity).execute();

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
});
