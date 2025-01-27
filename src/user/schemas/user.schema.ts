import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Blog, BlogSchema } from 'src/blog/schemas/blog.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  age?: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Blog.name }],
    ref: 'Blog',
    default: [],
  })
  blog: Blog[];
}

export const UserSchema = SchemaFactory.createForClass(User);
