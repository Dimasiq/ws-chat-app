import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from 'src/entities/user.entity';
import { IUserRes } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUser(id) {
    const userData = await this.userModel.findById(id);
    if (!userData) {
      throw new UnauthorizedException();
    }

    return {
      userId: userData._id.toString(),
      username: userData.username,
    };
  }

  async signupHandler(
    username: string,
    plainPassword: string,
  ): Promise<IUserRes> {
    const password = await this.hashPassword(plainPassword);
    const userData = await this.userModel.create({
      username,
      password,
    });

    const { access_token, refresh_token } = await this.generateJWT(
      userData._id.toString(),
      userData.username,
    );

    await userData.updateOne(
      {
        _id: userData._id,
      },
      {
        refresh_token,
      },
    );

    return {
      userId: userData._id.toString(),
      username: userData.username,
      access_token,
      refresh_token,
    };
  }

  async signinHandler(
    username: string,
    plainPassword: string,
  ): Promise<IUserRes> {
    const userData = await this.userModel.findOne({
      username,
    });

    if (!userData) {
      throw new UnauthorizedException('Invalid username!');
    }

    const isValidPassword = await this.comparePasswords(
      plainPassword,
      userData.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password!');
    }

    const { access_token, refresh_token } = await this.generateJWT(
      userData._id.toString(),
      userData.username,
    );

    return {
      userId: userData._id.toString(),
      username: userData.username,
      access_token,
      refresh_token,
    };
  }

  async refreshHandler(refreshToken: string): Promise<IUserRes> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.userId;
      const username = payload.username;

      if (!userId || !username) {
        throw new UnauthorizedException();
      }

      const { access_token, refresh_token } = await this.generateJWT(
        userId,
        username,
      );

      return {
        userId,
        username,
        access_token,
        refresh_token,
      };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  private async comparePasswords(
    plainPass: string,
    hashedPass: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPass, hashedPass);
  }

  private async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
  }

  private async generateJWT(userId: string, username: string) {
    const payload = { userId, username };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '30m',
        secret: process.env.JWT_SECRET,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '10d',
        secret: process.env.JWT_SECRET,
      }),
    };
  }
}
