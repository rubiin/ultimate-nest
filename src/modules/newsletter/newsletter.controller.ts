import { Body, Delete, Post } from "@nestjs/common";
import { Observable } from "rxjs";
import { GenericController, SwaggerResponse } from "@common/decorators";
import { CursorPaginationDto } from "@common/dtos";
import type { NewsLetter, Subscriber } from "@entities";
import { ControllerFactory } from "@lib/crud/crud.controller";
import { NewsLetterService } from "./newsletter.service";
import { CreateNewsletterDto, EditNewsletterDto, SubscribeNewsletterDto } from "./dto";

@GenericController("newsletter")
export class NewsLetterController extends ControllerFactory<
    NewsLetter,
    CursorPaginationDto,
    CreateNewsletterDto,
    EditNewsletterDto
>(CursorPaginationDto, CreateNewsletterDto, EditNewsletterDto) {
  constructor(protected service: NewsLetterService) {
    super();
  }

  @Post("subscribe")
  @SwaggerResponse({
    operation: "Subscribe to newsletter",
    badRequest: "Subscription already exist.",
  })
  subscribeNewsLetter(@Body() dto: SubscribeNewsletterDto): Observable<Subscriber> {
    return this.service.subscribeNewsLetter(dto);
  }

  @Delete("unsubscribe")
  @SwaggerResponse({
    operation: "Subscribe to newsletter",
    notFound: "Subscription does not exist.",
  })
  unSubscribeNewsLetter(@Body() dto: SubscribeNewsletterDto): Observable<Subscriber> {
    return this.service.unSubscribeNewsLetter(dto);
  }
}
