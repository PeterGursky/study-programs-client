import { Auth } from 'src/entities/auth';

export class Login {
  static readonly type= "[Login Component] login";
  constructor(public auth: Auth){}
}

export class Logout {
  static readonly type="[NavBar Component] logout";
}

export class UrlAfterLogin {
  static readonly type="[AuthGuard] redirect url after login"
  constructor(public url: string){}
}