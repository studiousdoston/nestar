import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { Member, Members } from '../../libs/dto/member/member';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';

import { Direction, Message } from '../../libs/enums/common.enum';
import { StatsModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private authService: AuthService,
    private viewService: ViewService,
  ) {}

  //* ---- SIGNUP -----
  public async signup(input: MemberInput): Promise<Member> {
    //Password Hashing
    input.memberPassword = await this.authService.hashPassword(input.memberPassword);
    try {
      const result = await this.memberModel.create(input);
      //Authentication via TOKENS
      result.accessToken = await this.authService.createToken(result);
      return result;
    } catch (err) {
      console.log('Error Service.model:', err instanceof Error ? err.message : err);
      throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
    }
  }

  //* ---- LOGIN -----
  public async login(input: LoginInput): Promise<Member> {
    const { memberNick, memberPassword } = input;
    const response = await this.memberModel.findOne({ memberNick }).select('+memberPassword').exec();

    if (!response || response.memberStatus === MemberStatus.DELETE) {
      throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
    } else if (response.memberStatus === MemberStatus.BLOCK) {
      throw new InternalServerErrorException(Message.BLOCKED_USER);
    }
    // Compare passwords
    const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword!);
    if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
    response.accessToken = await this.authService.createToken(response);
    return response;
  }

  //* ---- UPDATE_MEMBER -----
  public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberStatus: MemberStatus.ACTIVE,
        },
        input,
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    result.accessToken = await this.authService.createToken(result);
    return result;
  }

  //* ---- GET_MEMBER -----
  public async getMember(memberId: ObjectId | null, targetId: ObjectId): Promise<Member> {
    const search: T = {
      _id: targetId,
      memberStatus: {
        $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
      },
    };
    let targetMember = await this.memberModel.findOne(search).lean().exec();
    if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    //* logged in user and not self-viewing user can create new View doc
    if (memberId && String(memberId) !== String(targetId)) {
      const viewInput: ViewInput = { memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
      const newView = await this.viewService.recordView(viewInput);

      //* newView === null | undefined this block gets skipped entirely, cause the viewer has already viewed this particular user(profile) before
      if (newView) {
        targetMember = await this.memberModel
          .findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true })
          .lean()
          .exec();
        if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
      }

      //* Liked by me?
      //* Followed by me?
    }
    return targetMember;
  }

  //* ---- GET_AGENTS -----
  public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
    const { text } = input.search;
    const match: T = {
      memberType: MemberType.AGENT,
      memberStatus: MemberStatus.ACTIVE,
    };
    const sort: T = {
      [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC,
    };

    if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
    console.log('\n match', match);

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    console.log('result', result);
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  //*---- GET_ALL MEMBERS_BY_ADMIN -----
  public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
    const { memberStatus, memberType, text } = input.search;

    const match: T = {};

    const sort: T = {
      [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC,
    };

    if (memberStatus) match.memberStatus = memberStatus;
    if (memberType) match.memberType = memberType;
    if (text) match.memberNick = { $regex: new RegExp(text, 'i') };

    console.log('\n match', match);
    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    console.log('result', result);
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  //* ---- UPDATE_MEMBERS_BY_ADMIN -----
  public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
    const result = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  //* ---- MEMBER_STATS_EDITOR -----
  public async memberStatsEditor(input: StatsModifier): Promise<Member> {
    console.log('MEMBER_STATS_EDITOR executed!');
    const { _id, targetKey, modifier } = input;
    const result = await this.memberModel
      .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }
}
