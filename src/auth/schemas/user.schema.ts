import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'registro_usuario' })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  lastNameFather: string;

  @Prop({ required: true })
  lastNameMother: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
