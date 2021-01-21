import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';
import { UrlAfterLogin } from 'src/shared/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private store: Store, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isAuthentificated(state.url);
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.isAuthentificated(route.path);
  }

  isAuthentificated(url : string): boolean | Observable<boolean> {
    if (this.store.selectSnapshot(state => state.auth.name)) {
      return true;
    }
    return this.store.dispatch(new UrlAfterLogin(url)).pipe(
      tap(() => this.router.navigateByUrl("/login")),
      mapTo(false)
    )
  }

}
