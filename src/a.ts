import { t, validatedPlainToClass, ValidationFailed } from '@deepkit/type';
export class MarshalModel {
	@t.mongoId
	ready?: boolean;

	@t.array(String) tags: string[] = [];

	@t priority = 0;

	constructor(@t public id: number, @t public name: string) {}
}

const data = {
	name: 1,
	id: 1,
	tags: ['a', 'c'],
	priority: true,
	ready: 1,
};

try {
	const entity = await validatedPlainToClass(MarshalModel, data);
} catch (error) {
	if (error instanceof ValidationFailed) {
		//handle that case.
	}
}

console.info(errors);
