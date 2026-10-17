import { IsNestedField } from "@common/decorators";
import { IsUniqueConstraint } from "@common/decorators/validation/is-unique.validator";
import { createMock } from "@golevelup/ts-vitest";
import { EntityManager } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Test } from "@nestjs/testing";
import { Type } from "class-transformer";
import { useContainer, validate, ValidateNested } from "class-validator";

import { CreateUserDto, SocialDto } from "./create-user.dto";

// The inline stack `social` used before the refactor to IsNestedField.
class InlineStack {
  @ValidateNested()
  @Type(() => SocialDto)
  social?: SocialDto;
}

class IsNestedFieldStack {
  @IsNestedField(SocialDto, { required: false })
  social?: SocialDto;
}

const VALID_SOCIAL = {
  facebook: "https://facebook.com/rubiin",
  linkedin: "https://linkedin.com/in/rubiin",
  twitter: "https://twitter.com/rubiin",
};

const outcome = async (dto: object) => {
  const errors = await validate(dto);
  const social = errors.filter((error) => error.property === "social");

  return social.map((error) => ({
    children: (error.children ?? []).map((child) => ({
      constraints: Object.keys(child.constraints ?? {}),
      property: child.property,
    })),
    constraints: Object.keys(error.constraints ?? {}),
  }));
};

describe("createUserDto social", () => {
  // `@IsUnique` on `CreateUserDto` needs an EntityManager; unrelated to nested validation here.
  const mockEm = createMock<EntityManager<PostgreSqlDriver>>();

  beforeEach(async () => {
    mockEm.count.mockResolvedValue(0);

    const module = await Test.createTestingModule({
      providers: [
        IsUniqueConstraint,
        { provide: EntityManager<PostgreSqlDriver>, useValue: mockEm },
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  afterEach(() => {
    useContainer(null as never);
  });

  const cases = [
    { name: "an omitted social block", value: undefined },
    { name: "a valid social block", value: VALID_SOCIAL },
    { name: "a partial social block", value: { twitter: "https://twitter.com/rubiin" } },
    { name: "a social block with an invalid url", value: { twitter: "not-a-url" } },
    { name: "a social block that is not an object", value: 42 },
  ];

  for (const { name, value } of cases) {
    it(`should validate ${name} the same as the inline stack did`, async () => {
      const inline = await outcome(Object.assign(new InlineStack(), { social: value }));
      const shared = await outcome(Object.assign(new IsNestedFieldStack(), { social: value }));

      expect(shared).toEqual(inline);
    });
  }

  it("should be wired to the same stack as the dto itself", async () => {
    // Guards the refactor: the production `social` property must match IsNestedField's stack.
    const production = await outcome(Object.assign(new CreateUserDto(), { social: VALID_SOCIAL }));

    expect(production).toEqual(
      await outcome(Object.assign(new IsNestedFieldStack(), { social: VALID_SOCIAL })),
    );
  });

  it("should treat the social block as optional", async () => {
    expect(
      await outcome(Object.assign(new IsNestedFieldStack(), { social: undefined })),
    ).toHaveLength(0);
  });

  it("should not require the social block on the real dto", async () => {
    // `required: true` would add isNotEmpty here, which the inline stack never had.
    const production = await outcome(Object.assign(new CreateUserDto(), { social: undefined }));

    expect(production).toHaveLength(0);
  });

  it("should reject a social block that is not an object", async () => {
    const errors = await outcome(Object.assign(new IsNestedFieldStack(), { social: 42 }));

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toContain("nestedValidation");
  });

  it("should surface nested url errors", async () => {
    const errors = await outcome(
      Object.assign(new IsNestedFieldStack(), { social: { twitter: "not-a-url" } }),
    );

    expect(errors[0].children?.length).toBeGreaterThan(0);
  });
});
