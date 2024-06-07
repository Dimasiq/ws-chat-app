import {
  Controller,
  Req,
  Res,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IAuthorizedRequest, IAuthBody } from 'src/types';
import { CookieOptions, Request, Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private cookieOpt: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  };

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfileData(@Req() req: IAuthorizedRequest) {
    const id = req.user;
    return this.authService.getUser(id);
  }

  @Post('signup')
  async authSignup(
    @Body() signupBody: IAuthBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, password } = signupBody;
    const data = await this.authService.signupHandler(username, password);
    res.cookie('access_token', data.access_token, this.cookieOpt);
    res.cookie('refresh_token', data.refresh_token, this.cookieOpt);

    return data;
  }

  @Post('signin')
  async authSignin(
    @Body() signinBody: IAuthBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, password } = signinBody;
    const data = await this.authService.signinHandler(username, password);
    res.cookie('access_token', data.access_token, this.cookieOpt);
    res.cookie('refresh_token', data.refresh_token, this.cookieOpt);

    return data;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    const data = await this.authService.refreshHandler(refreshToken);
    res.cookie('access_token', data.access_token, this.cookieOpt);
    res.cookie('refresh_token', data.refresh_token, this.cookieOpt);

    return data;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', this.cookieOpt);
    res.clearCookie('refresh_token', this.cookieOpt);
  }
}
