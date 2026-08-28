import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';

import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  //! ---- SIGNUP -----
  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('Mutation: signup');
    console.log('input: ', input);
    return await this.memberService.signup(input);
  }

  //! ---- LOGIN -----
  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }

  //! ---- CHECK_AUTH -----
  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember() member: Member): Promise<string> {
    console.log('Query: checkAuth');
    const { memberNick, _id } = member;
    console.log('memberNick ->', memberNick, '|', _id);
    return `check auth executed! ${memberNick}`;
  }

  //! ---- CHECK_AUTH_ROLES -----
  @Roles(MemberType.USER, MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(@AuthMember() member: Member): Promise<string> {
    console.log('Query: checkAuthRoles');

    return `checkAuthRoles executed! ${member.memberNick}, you are ${member.memberType} and your ID is $${member._id}`;
  }

  //! ---- UPDATE_MEMBER -----
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: mongoose.ObjectId,
    //* @AuthMember helps extract memberId
  ): Promise<Member> {
    console.log('Mutation: updateMember');
    delete input._id;
    console.log('memberId', memberId);
    return await this.memberService.updateMember(memberId, input);
  }

  //! ---- GET_MEMBER -----
  @UseGuards(WithoutGuard)
  @Query(() => Member)
  public async getMember(
    @Args('memberId') input: string, //* target member's ID  -- viewee
    @AuthMember('_id') memberId: mongoose.ObjectId, //* user's id (id | null) -- viewer
  ): Promise<Member> {
    console.log('\n Query: getMember');
    const target = shapeIntoMongoObjectId(input);
    return await this.memberService.getMember(memberId, target);
  }

  //! ---- GET_AGENTS -----
  @UseGuards(WithoutGuard)
  @Query(() => Members)
  public async getAgents(
    @Args('input') input: AgentsInquiry,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Members> {
    return await this.memberService.getAgents(memberId, input);
  }

  //*     ADMIN

  //! ---- GET_ALL MEMBERS_BY_ADMIN -----
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Members)
  public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
    console.log('Query: getAllMembersByAdmin');
    return await this.memberService.getAllMembersByAdmin(input);
  }

  //! ---- UPDATE_MEMBERS_BY_ADMIN -----
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
    console.log('Mutation: updateMemberByAdmin');
    return await this.memberService.updateMemberByAdmin(input);
  }

  //----------------------------------------------------------
  //*                      UPLOADER
  //----------------------------------------------------------

  //! ---- IMAGE_UPLOADER -----
  @UseGuards(AuthGuard)
  @Mutation((returns) => String)
  public async imageUploader(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: String,
  ): Promise<string> {
    console.log('Mutation: imageUploader');

    if (!filename) throw new Error(Message.UPLOAD_FAILED);
    const validMime = validMimeTypes.includes(mimetype);
    if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

    const imageName = getSerialForImage(filename);
    const url = `uploads/${target}/${imageName}`;
    const stream = createReadStream();

    const result = await new Promise((resolve, reject) => {
      stream
        .pipe(createWriteStream(url))
        .on('finish', async () => resolve(true))
        .on('error', () => reject(false));
    });
    if (!result) throw new Error(Message.UPLOAD_FAILED);

    return url;
  }

  //! ---- IMAGES_UPLOADER -----
  @UseGuards(AuthGuard)
  @Mutation((returns) => [String])
  public async imagesUploader(
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: String,
  ): Promise<string[]> {
    console.log('Mutation: imagesUploader');

    const uploadedImages: string[] = [];
    const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
      try {
        const { filename, mimetype, encoding, createReadStream } = await img;

        const validMime = validMimeTypes.includes(mimetype);
        if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

        const imageName = getSerialForImage(filename);
        const url = `uploads/${target}/${imageName}`;
        const stream = createReadStream();

        const result = await new Promise((resolve, reject) => {
          stream
            .pipe(createWriteStream(url))
            .on('finish', () => resolve(true))
            .on('error', () => reject(false));
        });
        if (!result) throw new Error(Message.UPLOAD_FAILED);

        uploadedImages[index] = url;
      } catch (err) {
        console.log('Error, file missing!');
      }
    });

    await Promise.all(promisedList);
    return uploadedImages;
  }
}
