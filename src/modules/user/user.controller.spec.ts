import { Roles } from "@common/@types";
import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { of } from "rxjs";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController", () => {
  const service = createMock<UserService>();
  let controller: UserController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new UserController(service);
    vi.mocked(service.referUser).mockReturnValue(of({} as never));
    vi.mocked(service.findAll).mockReturnValue(of({ data: [], meta: {} as never }));
    vi.mocked(service.create).mockReturnValue(of({} as never));
    vi.mocked(service.findOne).mockReturnValue(of({} as never));
    vi.mocked(service.update).mockReturnValue(of({} as never));
    vi.mocked(service.remove).mockReturnValue(of({} as never));
  });

  it("delegates a referral to the logged-in user", () => {
    const dto = { mobileNumber: "9800000000" } as never;
    const user = { id: 1 } as User;

    controller.referUser(dto, user);

    expect(service.referUser).toHaveBeenCalledWith(dto, user);
  });

  it("lists users", () => {
    const dto = { limit: 10 } as never;

    controller.findAll(dto);

    expect(service.findAll).toHaveBeenCalledWith(dto);
  });

  it("registers a public user with the AUTHOR role and the uploaded avatar", () => {
    const dto = { email: "a@example.com" } as never;
    const image = { mimetype: "image/png" } as never;

    controller.publicRegistration(dto, image);

    expect(service.create).toHaveBeenCalledWith({
      email: "a@example.com",
      files: image,
      roles: [Roles.AUTHOR],
    });
  });

  it("creates a user with an optional avatar", () => {
    const dto = { email: "a@example.com" } as never;

    controller.create(dto, undefined);

    expect(service.create).toHaveBeenCalledWith({ email: "a@example.com", files: undefined });
  });

  it("fetches one user", () => {
    controller.findOne("user-1");

    expect(service.findOne).toHaveBeenCalledWith("user-1");
  });

  it("updates a user, passing the optional avatar through", () => {
    const dto = { email: "b@example.com" } as never;
    const image = { mimetype: "image/png" } as never;

    controller.update("user-1", dto, image);

    expect(service.update).toHaveBeenCalledWith("user-1", dto, image);
  });

  it("removes a user", () => {
    controller.remove("user-1");

    expect(service.remove).toHaveBeenCalledWith("user-1");
  });
});
