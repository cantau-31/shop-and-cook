import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../decorators/roles.decorator';

@Injectable()
export class AuthorOrAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceAuthorId = request.resourceAuthorId as string | number | undefined;

    if (!user) {
      throw new ForbiddenException({ code: 'ERR_FORBIDDEN', message: 'Forbidden' });
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    if (!resourceAuthorId) {
      throw new ForbiddenException({
        code: 'ERR_FORBIDDEN',
        message: 'Resource author not resolved'
      });
    }

    const sameAuthor = String(resourceAuthorId) === String(user.id);

    if (!sameAuthor) {
      throw new ForbiddenException({ code: 'ERR_FORBIDDEN', message: 'Forbidden' });
    }

    return true;
  }
}
