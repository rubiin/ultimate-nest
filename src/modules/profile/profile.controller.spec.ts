import { User } from "@entities";
import { createMock } from "@golevelup/ts-vitest";
import { of } from "rxjs";

import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

describe("ProfileController", () => {
  const service = createMock<ProfileService>();
  let controller: ProfileController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProfileController(service);
    vi.mocked(service.getProfileByUsername).mockReturnValue(of({} as User));
    vi.mocked(service.follow).mockReturnValue(of({} as never));
    vi.mocked(service.unFollow).mockReturnValue(of({} as never));
  });

  it("fetches the logged-in user's profile with the follow relations", () => {
    controller.profile("ada");

    expect(service.getProfileByUsername).toHaveBeenCalledWith("ada", ["followers", "followed"]);
  });

  it("follows the given username", () => {
    const user = { id: 1 } as User;

    controller.follow(user, "grace");

    expect(service.follow).toHaveBeenCalledWith(user, "grace");
  });

  it("unfollows the given username", () => {
    const user = { id: 1 } as User;

    controller.unFollow(user, "grace");

    expect(service.unFollow).toHaveBeenCalledWith(user, "grace");
  });
});
