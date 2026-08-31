import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { Member, TotalCounter } from '../member/member';

//*--------------------Property----------------------------
@ObjectType()
export class Property {
  @Field(() => String)
  _id!: mongoose.ObjectId;

  @Field(() => String)
  propertyType!: PropertyType;

  @Field(() => String)
  propertyStatus!: PropertyStatus;

  @Field(() => String)
  propertyLocation!: PropertyLocation;

  @Field(() => String)
  propertyAddress!: string;

  @Field(() => String)
  propertyTitle!: string;

  @Field(() => Number)
  propertyPrice!: number;

  @Field(() => Number)
  propertySquare!: number;

  @Field(() => Number)
  propertyBeds!: number;

  @Field(() => Number)
  propertyRooms!: number;

  @Field(() => Number)
  propertyViews!: number;

  @Field(() => Number)
  propertyLikes!: number;

  @Field(() => Number)
  propertyComments!: number;

  @Field(() => Number)
  propertyRank!: number;

  @Field(() => [String])
  propertyImages!: string[];

  @Field(() => String, { nullable: true })
  propertyDesc?: number;

  @Field(() => Boolean)
  propertyBarter!: boolean;

  @Field(() => Boolean)
  propertyRent!: boolean;

  @Field(() => String)
  memberId!: mongoose.ObjectId;

  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => String, { nullable: true })
  constructedAt?: Date;

  @Field(() => Date)
  createdAt!: Date;

  //* From Aggregation

  @Field(() => Member, { nullable: true })
  memberData?: Member;
}

//*--------------------Properties----------------------------
@ObjectType()
export class Properties {
  @Field(() => [Property])
  list!: Property[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter!: TotalCounter[];
}
