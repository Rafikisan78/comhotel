import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: configService.get<string>('OAUTH_AUTHORIZATION_URL'),
      tokenURL: configService.get<string>('OAUTH_TOKEN_URL'),
      clientID: configService.get<string>('OAUTH_CLIENT_ID'),
      clientSecret: configService.get<string>('OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get<string>('OAUTH_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { emails, name, id } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      oauthId: id,
      accessToken,
    };

    return user;
  }
}
