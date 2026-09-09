import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from '../../nestar-api/src/schemas/Property.model';
import MemberSchema from '../../nestar-api/src/schemas/Member.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: 'Property', schema: PropertySchema },
      { name: 'Member', schema: MemberSchema },
    ]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
