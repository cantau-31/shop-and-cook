import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAccessTokenGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch(() => true);
      }
      return result;
    } catch {
      return true;
    }
  }

  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
