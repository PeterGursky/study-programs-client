import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { ServerService } from 'src/services/server.service';
import { AuthState } from './auth.state';
import { GetTeacher, RemoveTeacherResearch, RemoveTeacherUrl, SaveTeacherResearch, SaveTeacherUrl } from './teachers.actions';

export interface TeachersModel {
}

@State<TeachersModel>({
  name:'teachers',
  defaults: {}
})
@Injectable()
export class TeachersState {
  static teacherById(id:string) {
    return createSelector([TeachersState], (state: TeachersModel) => state[id]);
  }
  
  constructor(private serverService:ServerService, private store:Store){}

  @Action([GetTeacher])
  getTeacher(ctx: StateContext<TeachersModel>, {id}: GetTeacher) {
    const teachers = ctx.getState();
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    if (teachers[id]) {
      return;
    }
    return this.serverService.getTeacherById(id).pipe(
      tap(teacher => {
        ctx.patchState({ [id]: teacher })
      })
    )
  }

  @Action(SaveTeacherUrl)
  changeUrl(ctx: StateContext<TeachersModel>, {teacherId, url}: SaveTeacherUrl) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.saveTeacherUrl(httpOptions,teacherId,url).pipe(
      tap(teacher => ctx.patchState({[teacher.id] : teacher}))
    );
  }

  @Action(RemoveTeacherUrl)
  removeUrl(ctx: StateContext<TeachersModel>, {teacherId}: RemoveTeacherUrl) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.removeTeacherUrl(httpOptions,teacherId).pipe(
      tap(teacher => ctx.patchState({[teacher.id] : teacher}))
    );
  }

  @Action(SaveTeacherResearch)
  changeResearch(ctx: StateContext<TeachersModel>, {teacherId, research}: SaveTeacherResearch) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.saveTeacherResearch(httpOptions,teacherId,research).pipe(
      tap(teacher => ctx.patchState({[teacher.id] : teacher}))
    );
  }

  @Action(RemoveTeacherResearch)
  removeResearch(ctx: StateContext<TeachersModel>, {teacherId}: RemoveTeacherResearch) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.removeTeacherResearch(httpOptions,teacherId).pipe(
      tap(teacher => ctx.patchState({[teacher.id] : teacher}))
    );
  }
}