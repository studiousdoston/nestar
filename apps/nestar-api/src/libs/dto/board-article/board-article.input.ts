import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { availableAgentSorts, availableBoardArticleSorts } from '../../config';

//*--------------------BoardArticleInput----------------------------
@InputType()
export class BoardArticleInput {
  @IsNotEmpty()
  @Field(() => BoardArticleCategory)
  articleCategory!: BoardArticleCategory;

  @IsNotEmpty()
  @Length(3, 50)
  @Field(() => String)
  articleTitle!: string;

  @IsNotEmpty()
  @Length(3, 1000)
  @Field(() => String)
  articleContent!: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  articleImage?: string;

  memberId?: ObjectId;
}

//*--------------------BAISearch----------------------------
@InputType()
class BAISearch {
  @IsOptional()
  @Field(() => BoardArticleCategory, { nullable: true })
  articleCategory?: BoardArticleCategory;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: mongoose.ObjectId;
}

//*-----------------BoardArticlesInquiry------------------------
@InputType()
export class BoardArticlesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableBoardArticleSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => BAISearch)
  search!: BAISearch;
}

//*-----------------ABAISearch------------------------
@InputType()
class ABAISearch {
  @IsOptional()
  @Field(() => BoardArticleStatus, { nullable: true })
  articleStatus?: BoardArticleStatus;

  @IsOptional()
  @Field(() => BoardArticleCategory, { nullable: true })
  articleCategory?: BoardArticleCategory;
}

//*-----------------AllBoardArticlesInquiry------------------------
@InputType()
export class AllBoardArticlesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableBoardArticleSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => ABAISearch)
  search!: ABAISearch;
}
