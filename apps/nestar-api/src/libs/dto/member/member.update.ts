import { Field, InputType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberStatus, MemberType } from '../../enums/member.enum';

@InputType()
export class MemberUpdate {
  @IsNotEmpty()
  @Field(() => String)
  _id?: mongoose.ObjectId;

  @IsOptional()
  @Length(3, 12)
  @Field(() => String, { nullable: true })
  memberNick?: string;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => MemberStatus, { nullable: true })
  memberStatus?: MemberStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberPhone?: string;

  @IsOptional()
  @Length(5, 12)
  @Field(() => String, { nullable: true })
  memberPassword?: string;

  @IsOptional()
  @Length(5, 50)
  @Field(() => String, { nullable: true })
  memberFullName?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberImage?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberAddress?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberDesc?: string;

  deletedAt?: Date;
}
