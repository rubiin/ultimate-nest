import {BaseEntity} from "@common/database/base-entity.entity";
import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {Post} from "./post.entity";
import {User} from "./user.entity";

@Entity()
export class Comment extends BaseEntity {
    @Property()
    body: string;

    @ManyToOne()
    post: Post;

    @ManyToOne()
    author: User;

    constructor(author: User, post: Post, body: string) {
        super();
        this.author = author;
        this.post = post;
        this.body = body;
    }
}
