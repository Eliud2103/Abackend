import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'usuarios'  })
export class User {
  @Prop({ type: Types.ObjectId, auto: true }) // Mongoose manejará el _id automáticamente
  _id: Types.ObjectId;

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
  
  @Prop({ default: Date.now })
  passwordChangedAt: Date; 

  @Prop({ required: true, enum: ['usuario', 'hospital', 'clinica', 'farmacia', 'laboratorio', 'doctor','admin'],
    default: 'admin',
   })
  role?: string; // Define qué tipo de usuario es
}

// Ahora definimos el schema después de la declaración de la clase User
export const UserSchema = SchemaFactory.createForClass(User);

// Establecemos la transformación después de la creación del schema
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toString();  // Asignamos _id a id
    delete ret._id;     // Eliminamos _id para evitar redundancia
  },
});

// Agregamos un campo virtual para `id`
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
