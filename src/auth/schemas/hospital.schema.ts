import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalDocument = Hospital & Document;

@Schema({ collection: 'registro_hospital' })
export class Hospital {
  @Prop({ required: true })
  nombre_hospital: string; // Nombre del hospital

  @Prop({ required: true })
  tipo_hospital: string; // Tipo de hospital (Público, Privado, etc.)

  @Prop({ required: true })
  numero_licencia_sanitaria: string; // Número de licencia sanitaria

  @Prop({ required: true })
  direccion: string;

  @Prop()
  telefono?: string;

  @Prop({ required: true })
  email_hospital: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  descripcion?: string;

  // 📌 Definimos "responsable" directamente dentro del esquema de Hospital
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
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
