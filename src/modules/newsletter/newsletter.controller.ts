import { GenericController, Public, SwaggerResponse } from "@common/decorators";
import { CursorPaginationDto } from "@common/dtos";
import { NewsLetter, Subscriber } from "@entities";
import { ControllerFactory } from "@lib/crud/crud.controller";
import { Body, Delete, Get, Param, Post } from "@nestjs/common";
import { Observable } from "rxjs";

import { SubscribeNewsletterDto } from "./dto";
import { CreateNewsletterDto, EditNewsletterDto } from "./dto";
import { NewsLetterService } from "./newsletter.service";

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
    badRequest: "Subscription already exist.",
    operation: "Subscribe to newsletter",
  })
  subscribeNewsLetter(@Body() dto: SubscribeNewsletterDto): Observable<Subscriber> {
    return this.service.subscribeNewsLetter(dto);
  }

  @Public()
  @Get("unsubscribe/:token")
  @SwaggerResponse({
    badRequest: "The link is invalid or has expired.",
    operation: "Unsubscribe with the link from a newsletter email",
    params: ["token"],
  })
  unSubscribeWithToken(@Param("token") token: string): Observable<{ message: string }> {
    return this.service.unSubscribeWithToken(token);
  }

  @Delete("unsubscribe")
  @SwaggerResponse({
    notFound: "Subscription does not exist.",
    operation: "Subscribe to newsletter",
  })
  unSubscribeNewsLetter(@Body() dto: SubscribeNewsletterDto): Observable<Subscriber> {
    return this.service.unSubscribeNewsLetter(dto);
  }
}
