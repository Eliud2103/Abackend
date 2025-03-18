import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FarmaciaDocument = Farmacia & Document;

@Schema({ collection: 'registro_farmacia' })
export class Farmacia {
  @Prop({ required: true })
  nombre_farmacia: string; // Nombre de la farmacia

  @Prop({ required: true })
  tipo_farmacia: string; // Tipo de farmacia (Pública, Privada, etc.)

  @Prop({ required: true })
  numero_licencia_sanitaria: string; // Número de licencia sanitaria

  @Prop({ required: true })
  direccion: string;

  @Prop()
  telefono?: string;

  @Prop({ required: true })
  email_farmacia: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  descripcion?: string;

  // 📌 Definimos "responsable" dentro del esquema de Farmacia
  @Prop({
    type: {
      nombre_responsable: { type: String, required: true },
      apellido_paterno_responsable: { type: String, required: true },
      apellido_materno_responsable: { type: String, required: true },
      email_responsable: { type: String, required: true },
      telefono_responsable: { type: String, required: true },
      password: { type: String, required: true },
    },
    required: true,
  })
  responsable: {
    nombre_responsable: string;
    apellido_paterno_responsable: string;
    apellido_materno_responsable: string;
    email_responsable: string;
    telefono_responsable: string;
    password: string;
  };

    // 📝 Campo para los comentarios de los usuarios
    @Prop({
      type: [
        {
          usuario: { type: String, required: true },  // Nombre del usuario que publicó el comentario
          texto: { type: String, required: true },    // Texto del comentario
          fecha: { type: Date, default: Date.now }    // Fecha en la que se publicó el comentario
        }
      ],
      default: [],
    })
    comentarios: { usuario: string, texto: string, fecha: Date }[]; // Array de comentarios
  /* @Prop({ required: true, default: 'farmacia' })
  role: string;*/
    // 📌 Campo para la URL de la imagen
    @Prop({ required: true })
    img: string; // Aquí se guardará la URL de la imagen del hospital
  
  
}

export const FarmaciaSchema = SchemaFactory.createForClass(Farmacia);
