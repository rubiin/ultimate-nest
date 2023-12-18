# Testing Nestjs applications

In the previous posts, I have write a lot of testing codes to verify if our application is working as expected.

Nestjs provides integration with with [Jest](https://github.com/facebook/jest)
and [Supertest](https://github.com/visionmedia/supertest) out-of-the-box, and testing harness for unit testing and
end-to-end (e2e) test.

## Nestjs test harness

Like the Angular 's `TestBed`, Nestjs provide a similar `Test` facilities to assemble the Nestjs components for your
testing codes.

```ts

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ...
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

```

## End-to-end testing

Nestjs integrates supertest to send a request to the server side.

Use `beforeAll` and `afterAll` to start and stop the application, use `request` to send a http request to the server and
assert the response result.
The `APP_URL` is the url of the server, it is defined in the `fixtures/constant.ts` file. This is the base url. Modify
it to your own url.
Also since we are not using app module, we need to separately run the server in one terminal and issue the test command
in another terminal.
To run the e2e test, use `make test-e2e` command.

```ts

import * as request from 'supertest';
import { APP_URL } from "../fixtures/constant";
//...

describe('API endpoints testing (e2e)', () => {

  	const app = APP_URL;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    });


    // an example of using supertest request.
		it("should get a list of all user /posts (GET)", () => {
			return request(app)
				.get("/posts")
				.auth(adminJwtToken, { type: "bearer" })
				.expect(({ body }) => {
					expect(body.meta).toBeDefined();
					expect(body.items).toBeDefined();
				})
				.expect(200);
		});
}

```

More details for the complete e2e tests, check Nestjs '
s [test folder](https://github.com/rubiin/ultimate-nest/tree/master/test).
