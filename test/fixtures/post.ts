import { faker } from "@mikro-orm/seeder";

export const postDto = {
	title: faker.name.firstName(),
	description: faker.name.firstName(),
	content: faker.lorem.sentence(),
	tags: [faker.company.name(), faker.company.name()],
};
