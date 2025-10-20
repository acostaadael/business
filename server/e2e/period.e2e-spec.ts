import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/security/guards/auth.guard';
import { RolesGuard } from '../src/security/guards/roles.guard';
import { PeriodDTO } from '../src/service/dto/period.dto';
import { PeriodService } from '../src/service/period.service';

describe('Period Controller', () => {
  let app: INestApplication;

  const authGuardMock = { canActivate: (): any => true };
  const rolesGuardMock = { canActivate: (): any => true };
  const entityMock: any = {
    id: 'entityId',
  };

  const serviceMock = {
    findById: (): any => entityMock,
    findAndCount: (): any => [entityMock, 0],
    save: (): any => entityMock,
    update: (): any => entityMock,
    deleteById: (): any => entityMock,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(RolesGuard)
      .useValue(rolesGuardMock)
      .overrideProvider(PeriodService)
      .useValue(serviceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/GET all periods ', async () => {
    const getEntities: PeriodDTO[] = (await request(app.getHttpServer()).get('/api/periods').expect(200)).body;

    expect(getEntities).toEqual(entityMock);
  });

  it('/GET periods by id', async () => {
    const getEntity: PeriodDTO = (await request(app.getHttpServer()).get(`/api/periods/${entityMock.id}`).expect(200)).body;

    expect(getEntity).toEqual(entityMock);
  });

  it('/POST create periods', async () => {
    const createdEntity: PeriodDTO = (await request(app.getHttpServer()).post('/api/periods').send(entityMock).expect(201)).body;

    expect(createdEntity).toEqual(entityMock);
  });

  it('/PUT update periods', async () => {
    const updatedEntity: PeriodDTO = (await request(app.getHttpServer()).put('/api/periods').send(entityMock).expect(201)).body;

    expect(updatedEntity).toEqual(entityMock);
  });

  it('/PUT update periods from id', async () => {
    const updatedEntity: PeriodDTO = (await request(app.getHttpServer()).put(`/api/periods/${entityMock.id}`).send(entityMock).expect(201))
      .body;

    expect(updatedEntity).toEqual(entityMock);
  });

  it('/DELETE periods', async () => {
    const deletedEntity: PeriodDTO = (await request(app.getHttpServer()).delete(`/api/periods/${entityMock.id}`).expect(204)).body;

    expect(deletedEntity).toEqual({});
  });

  afterEach(async () => {
    await app?.close();
  });
});
