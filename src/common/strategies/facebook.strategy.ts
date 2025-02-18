import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import facebookOathConfig from '../config/facebook.oath.config';
import { Strategy as FacebookStrategy, Profile } from 'passport-facebook';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class FacebookStrategyService extends PassportStrategy(
  FacebookStrategy,
  'facebook',
) {
  constructor(
    @Inject(facebookOathConfig.KEY)
    private facebookConfig: ConfigType<typeof facebookOathConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: facebookConfig.appId,
      clientSecret: facebookConfig.appSecret,
      callbackURL: facebookConfig.callbackUrl,
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('✅ Facebook Profile:', { profile });

    const user = await this.authService.signUp({
      email: profile.emails?.[0]?.value || '',
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      password: '',
    });

    return user;
  }
}
