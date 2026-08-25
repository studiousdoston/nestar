import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';
import { availableAgentSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick!: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword!: string;

  @IsNotEmpty()
  @Field(() => String)
  memberPhone!: string;

  //* Got Fixed in member.enum
  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  //* Got Fixed in member.enum
  @IsOptional()
  @Field(() => MemberAuthType, { nullable: true })
  memberAuthType?: MemberAuthType;
}

//------------------------------------------------------------------

@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick!: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword!: string;
}

//------------------------------------------------------------------
@InputType()
class ATSearch {
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  text?: string;
}

//------------------------------------------------------------------
@InputType()
export class AgentsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableAgentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @IsIn(availableAgentSorts)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ATSearch)
  search!: ATSearch;
}
