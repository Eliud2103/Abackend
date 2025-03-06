import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://kevingrst:IY5qcYxMVtVAdiha@ateneadbcluster.51nyt.mongodb.net/atenea?retryWrites=true&w=majority&appName=ateneaDBcluster'),

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
