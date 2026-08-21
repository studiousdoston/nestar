import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from '../../../libs/enums/common.enum';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext | any): Promise<boolean> {
    console.info('--- @guard() Authentication [AuthGuard] ---');

    if (context.contextType === 'graphql') {
      const request = context.getArgByIndex(2).req;
      /*
				 * "Reach into the raw arguments this GraphQL resolver was called with, grab the 3rd one (the GraphQL context), and pull the Express req object off of it."
      */
      const bearerToken = request.headers.authorization;
      if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);
      const token = bearerToken.split(' ')[1]; //* 'Bearer <token>'
      const authMember = await this.authService.verifyToken(token);

      if (!authMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
      console.log('memberNick[auth] =>', authMember.memberNick);
      request.body.authMember = authMember;

      return true;
    }
    // description => http, rpc, gprs and etc are ignored
    return false;
  }
}
