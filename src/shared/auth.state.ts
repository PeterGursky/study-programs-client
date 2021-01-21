import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { map } from 'rxjs/operators';
import { HttpOptionsType, ServerService } from 'src/services/server.service';
import { Login, Logout, UrlAfterLogin } from './auth.actions';

const DEFAULT_REDIRECT = "/"

export interface AuthModel {
  name: string;
  password: string;
  redirectAfterLogin: string;
  httpOptions: HttpOptionsType;
}

@State<AuthModel>({
  name: 'auth',
  defaults: { name: null, password: null, redirectAfterLogin: DEFAULT_REDIRECT, httpOptions: null }
})
@Injectable()
export class AuthState {

  @Selector()
  static auth(currentState: AuthModel) {
    return currentState.name 
            ? {name: currentState.name, password: currentState.password}
            : null;
  }

  @Selector()
  static username(currentState: AuthModel) {
    return currentState.name;
  }

  @Selector()
  static redirectUrl(currentState: AuthModel) {
    return currentState.redirectAfterLogin;
  }

  @Selector()
  static httpOptions(currentState: AuthModel) {
    return currentState.httpOptions;
  }

  constructor(private serverService: ServerService){}

//  ngxsAfterBootstrap(ctx: StateContext<AuthModel>) {
    ngxsOnInit(ctx: StateContext<AuthModel>) {
//  debugger;
    const {name, password} = ctx.getState();
    const newstate = {
      name,
      password,
      httpOptions: this.serverService.httpOptions({name, password}),
      redirectAfterLogin: DEFAULT_REDIRECT
    }
    ctx.setState(newstate);
  }

  @Action(Login)
  login(ctx: StateContext<AuthModel>, action: Login) {
    const httpOptions = this.serverService.httpOptions(action.auth);
    return this.serverService.checkCredentials(httpOptions, true).pipe(
      map(ok => {
        if (ok) {
          ctx.patchState({
            name: action.auth.name,
            password: action.auth.password,
            httpOptions
          });  
        }
      })
    )
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthModel>, action: Logout) {
    ctx.setState({
      name: null,
      password: null,
      httpOptions: null,
      redirectAfterLogin: DEFAULT_REDIRECT
    });
  }

  @Action(UrlAfterLogin)
  setUrlAfterLogin(ctx: StateContext<AuthModel>, action: UrlAfterLogin) {
    ctx.patchState({
      redirectAfterLogin: action.url
    });
  }
}