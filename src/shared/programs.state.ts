import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { ServerService } from 'src/services/server.service';
import { AuthState } from './auth.state';
import { AddFieldOfExpertise, GetStudyProgram, RemoveFieldOfExpertise } from './programs.actions';

export interface StudyProgramsModel {
}

@State<StudyProgramsModel>({
  name:'programs',
  defaults: {}
})
@Injectable()
export class ProgramsState {
  static programById(id:string) {
    return createSelector([ProgramsState], (state: StudyProgramsModel) => state[id]);
  }
  
  constructor(private serverService:ServerService, private store:Store){}

  @Action([GetStudyProgram])
  getStudyProgram(ctx: StateContext<StudyProgramsModel>, {id}: GetStudyProgram) {
    const programs = ctx.getState();
    if (programs[id]) {
      return;
    }
    return this.serverService.getStudyProgramById(id).pipe(
      tap(studyProgram => {
        ctx.patchState({ [id]: studyProgram })
      })
    )
  }

  @Action(AddFieldOfExpertise)
  addFieldOfExpertise(ctx: StateContext<StudyProgramsModel>, {programId, expertiseName}: AddFieldOfExpertise) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.addFieldOfExpertiseToProgram(httpOptions,programId,expertiseName).pipe(
      tap(studyProgram => {
        ctx.patchState({ [programId]: studyProgram })
      })      
    );
  }

  @Action(RemoveFieldOfExpertise)
  removeFieldOfExpertise(ctx: StateContext<StudyProgramsModel>, {programId, foeId}: RemoveFieldOfExpertise) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.removeFieldOfExpertiseInProgram(httpOptions,programId,foeId).pipe(
      tap(studyProgram => {
        ctx.patchState({ [programId]: studyProgram })
      })      
    );
  }
}