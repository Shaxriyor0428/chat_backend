import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../../auth/auth.service';
import githubOathConfig from '../config/github.oath.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    @Inject(githubOathConfig.KEY)
    private githubConfiguration: ConfigType<typeof githubOathConfig>,
  ) {
    super({
      clientID: githubConfiguration.clinetID,
      clientSecret: githubConfiguration.clientSecret,
      callbackURL: githubConfiguration.callbackURL,
      scope: ['user', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('Github : ', profile);

    const user = await this.authService.validateUser({
      email: profile.emails[0].value,
      firstName: profile?.displayName || '',
      lastName: profile?.name?.familyName || '',
      password: '',
    });

    return user;
  }
}
