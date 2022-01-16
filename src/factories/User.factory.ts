import { User } from '../entities/user.entity';
import { Factory } from '@mikro-orm/seeder';
import Faker from 'minifaker';
export class UserFactory extends Factory<User> {
  model = User;

  definition(faker: typeof Faker): Partial<User> {
    return {
      firstName: faker.firstName(),
      middleName: faker.firstName(),
      lastName: faker.lastName(),
      email: faker.email(),
      password: faker.password({minLength: 9, symbols: true, uppercases: true, numbers: true}),
    };
  }
}
