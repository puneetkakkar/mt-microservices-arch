import { Test, TestingModule } from '@nestjs/testing';
import { Service1Controller } from './service-1.controller';
import { Service1Service } from './service-1.service';

describe('Service1Controller', () => {
  let service1Controller: Service1Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Service1Controller],
      providers: [Service1Service],
    }).compile();

    service1Controller = app.get<Service1Controller>(Service1Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(service1Controller.getHello()).toBe('Hello World!');
    });
  });
});
