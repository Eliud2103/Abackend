import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'noticias' })
export class Publicacion extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  contenido: string;

  // Si estás usando una URL
  @Prop({ required: true })
  img: string; // Puedes hacer validación con @IsUrl() en el DTO si es necesario
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
