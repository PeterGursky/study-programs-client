import { A } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { Action, createSelector, State, StateContext, Store } from '@ngxs/store';
import { from, of } from 'rxjs';
import { concatAll, last, tap } from 'rxjs/operators';
import { StudyGoal } from 'src/entities/study-goal';
import { ServerService } from 'src/services/server.service';
import { AuthState } from './auth.state';
import { ChangeStudyGoalUrl, GetStudyGoal, GetStudyGoalsForStudyGoal, GetStudyGoalsForTeacher, 
  ReloadStudyGoals, RemoveStudyGoalRequirement, RemoveStudyGoalUrl, SaveStudyGoalRequirement, 
  SaveStudyGoalDescription, RemoveStudyGoalDescription } from './goals.actions';

export interface StudyGoalsModel {
  [id: string]: StudyGoal;
}

@State<StudyGoalsModel>({
  name:'goals',
  defaults: {}
})
@Injectable()
export class GoalsState {
  static goalById(id:string) {
    return createSelector([GoalsState], (state: StudyGoalsModel): StudyGoal => state[id]);
  }
  
  constructor(private serverService:ServerService, private store:Store){}

  @Action([GetStudyGoal])
  getStudyGoal(ctx: StateContext<StudyGoalsModel>, {id}: GetStudyGoal) {
    const goals = ctx.getState();
    if (goals[id] !== undefined) {
      return;
    }
    return this.serverService.getStudyGoalById(encodeURIComponent(id)).pipe(
      tap(studyGoal => {
        ctx.patchState({ [id]: studyGoal })
      })
    )
  }

  @Action([GetStudyGoalsForTeacher, GetStudyGoalsForStudyGoal])
  getStudyGoals(ctx: StateContext<StudyGoalsModel>, {ids}: GetStudyGoalsForTeacher | GetStudyGoalsForStudyGoal) {
    const goals = ctx.getState();
    const newIds = ids.filter(id => goals[id] === undefined)
    if (newIds.length == 0) {
      return;
    }
    newIds.forEach(id => ctx.patchState({[id]: null}))
    return from(newIds.map(id => this.serverService.getStudyGoalById(encodeURIComponent(id)))).pipe(
      concatAll(),
      tap(studyGoal => {
        if (studyGoal) {
          ctx.patchState({[studyGoal.id]: studyGoal})
        }
      }),
      last()
    );
  }

  @Action(ReloadStudyGoals)
  reloadStudyGoals(ctx: StateContext<StudyGoalsModel>, {ids}: ReloadStudyGoals) {
    ctx.setState (current => {
      return Object.entries(current).reduce((newState, sgPair) => ids.includes(sgPair[0]) ? newState : {...newState, [sgPair[0]]: sgPair[1]}, {});
    });
    return this.getStudyGoals(ctx, {ids});
  }

  @Action(ChangeStudyGoalUrl)
  changeUrl(ctx: StateContext<StudyGoalsModel>, {goalId, url}: ChangeStudyGoalUrl) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.saveStudyGoalUrl(httpOptions,encodeURIComponent(goalId),url).pipe(
      tap(goal => ctx.patchState({[goal.id] : goal}))
    );
  }
  
  @Action(RemoveStudyGoalUrl)
  removeUrl(ctx: StateContext<StudyGoalsModel>, {goalId}: RemoveStudyGoalUrl) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.removeStudyGoalUrl(httpOptions,encodeURIComponent(goalId)).pipe(
      tap(goal => ctx.patchState({[goal.id] : goal}))
    );
  }

  @Action(SaveStudyGoalDescription)
  changeDescription(ctx: StateContext<StudyGoalsModel>, {goalId, description}: SaveStudyGoalDescription) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.saveStudyGoalDescription(httpOptions,encodeURIComponent(goalId),description).pipe(
      tap(goal => ctx.patchState({[goal.id] : goal}))
    );
  }
  
  @Action(RemoveStudyGoalDescription)
  removeDescription(ctx: StateContext<StudyGoalsModel>, {goalId}: RemoveStudyGoalDescription) {
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.removeStudyGoalDescription(httpOptions,encodeURIComponent(goalId)).pipe(
      tap(goal => ctx.patchState({[goal.id] : goal}))
    );
  }

  @Action(SaveStudyGoalRequirement)
  saveRequirement(ctx: StateContext<StudyGoalsModel>, {goalId, requirement}: SaveStudyGoalRequirement){
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.saveStudyGoalRequirement(httpOptions,encodeURIComponent(goalId),requirement).pipe(
      tap(goal => ctx.patchState({[goal.id] : goal}))
    );
  }

  @Action(RemoveStudyGoalRequirement)
  removeRequirement(ctx: StateContext<StudyGoalsModel>, {goalId, requirementId}: RemoveStudyGoalRequirement){
    const httpOptions = this.store.selectSnapshot(AuthState.httpOptions);
    return this.serverService.removeStudyGoalRequirement(httpOptions,encodeURIComponent(goalId),encodeURIComponent(requirementId)).pipe(
      tap(goal => ctx.patchState({[goal.id] : goal}))
    );
  }
}