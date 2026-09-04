import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';

@InputType()
//*------------------ FollowSearch -------------------------
class FollowSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  followingId?: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  followerId?: ObjectId;
}

//*------------------ FollowInquiry -------------------------
@InputType()
export class FollowInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsNotEmpty()
  @Field(() => FollowSearch)
  search!: FollowSearch;
}
