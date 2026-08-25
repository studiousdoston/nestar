import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ViewGroup } from '../../enums/view.enum';
import mongoose from 'mongoose';

@InputType()
export class ViewInput {
  @IsNotEmpty()
  @Field(() => ViewGroup)
  viewGroup!: ViewGroup;

  @IsNotEmpty()
  @Field(() => String)
  viewRefId!: mongoose.ObjectId;

  @IsNotEmpty()
  @Field(() => String)
  memberId!: mongoose.ObjectId;
}
