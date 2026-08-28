import { Field, InputType, Int } from '@nestjs/graphql';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import mongoose from 'mongoose';

@InputType()
export class PropertyInput {
  @IsNotEmpty()
  @Field(() => String)
  propertyType!: PropertyType;

  // @IsOptional()
  // @Field(() => String)
  // propertyStatus?: PropertyStatus;

  @IsNotEmpty()
  @Field(() => String)
  propertyLocation!: PropertyLocation;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  propertyAddress!: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  propertyTitle!: string;

  @IsNotEmpty()
  @Field(() => Number)
  propertyPrice!: number;

  @IsNotEmpty()
  @Field(() => Number)
  propertySquare!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  propertyBeds!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  propertyRooms!: number;

  @IsNotEmpty()
  @Field(() => [String])
  propertyImages!: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  propertyDesc?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  propertyBarter?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  propertyRent?: boolean;

  memberId?: mongoose.ObjectId;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  constructedAt?: Date;
}
