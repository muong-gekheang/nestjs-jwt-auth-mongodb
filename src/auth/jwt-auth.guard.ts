import { JwtHeader } from './../../node_modules/@types/jsonwebtoken/index.d';
import { AuthService } from './auth.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { Auth } from './entities/auth.entity';

@Injectable()
// export class JwtAuthGuard implements CanActivate{
//   constructor(private readonly authService: AuthService){}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers.authorization;
//     if (!authHeader) {
//       throw new UnauthorizedException('No token provided');
//     }
//     const token = authHeader.split(' ')[1];
//     const decoded = await this.authService.verifyToken(token);
//     request.user = decoded;
//     console.log('AUTH HEADER:', authHeader);
//     console.log('TOKEN:', token);
//     console.log('DECODED:', decoded);
//     return true;
//   }
  
// }
export class JwtAuthGuard extends AuthGuard('jwt'){}
