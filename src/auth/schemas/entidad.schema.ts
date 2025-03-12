import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EntidadDocument = Entidad & Document;

@Schema()
export class Entidad {
  @Prop({ type: Types.ObjectId, ref: 'User',  }) 
  userId: Types.ObjectId; // Relación con el usuario responsable

  @Prop({  })
  name: string; // Nombre de la entidad (Hospital, Clínica, etc.)

  @Prop({  })
  type: string; // 'hospital', 'clinica', 'farmacia', 'laboratorio', 'doctor'

  @Prop({  })
  licenseNumber: string;

  @Prop({  }) 
  address: string;

  @Prop()
  phone?: string;

  @Prop()
  mission?: string;

  @Prop()
  vision?: string;

}

export const EntidadSchema = SchemaFactory.createForClass(Entidad);
