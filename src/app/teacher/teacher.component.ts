import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { map, switchMap } from 'rxjs/operators';
import { Teacher } from 'src/entities/teacher';
import { GetTeacher, RemoveTeacherResearch, RemoveTeacherUrl, SaveTeacherResearch, SaveTeacherUrl } from 'src/shared/teachers.actions';
import { TeachersState } from 'src/shared/teachers.state';
import { teacherRoleSK, TeacherRole } from 'src/entities/teacher'; 
import { StudyGoal, StudyGoalName } from 'src/entities/study-goal';
import { GetStudyGoalsForTeacher } from 'src/shared/goals.actions';
import { GoalsState } from 'src/shared/goals.state';
import { MatDialog } from '@angular/material/dialog';
import { SubjectsSettingsDialogComponent } from '../subjects-settings-dialog/subjects-settings-dialog.component';
import { SubjectsTableSettingsState } from 'src/shared/subjects-table-settings.state';
import { Observable, Subscription } from 'rxjs';
import { AuthState } from 'src/shared/auth.state';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit, OnDestroy {

  teacherId: string;
  teacher: Teacher;
  roles: {role: string, subjects: StudyGoalName[], studyGoals?: StudyGoal[]}[] = [];
  studyGoalsIds = [];
  studyGoals: StudyGoal[];
  showByRoles = true;
  @Select(SubjectsTableSettingsState.showByRoles) showByRoles$: Observable<boolean>;
  showByRolesSubscription: Subscription;
  editing = false;
  url = "";
  researchHTML = "";
  researchTXT = "";
  @Select(AuthState.username) userName$: Observable<string>;

  constructor(private route: ActivatedRoute, private store: Store, private dialog: MatDialog) { }
  
  ngOnInit(): void {
    this.route.params.pipe(
        map(params => this.teacherId = params.id),
        switchMap(id => this.store.dispatch(new GetTeacher(id))))
    .subscribe(() => {
      this.teacher = this.store.selectSnapshot(TeachersState.teacherById(this.teacherId));
      this.url = this.teacher.personalWebUrl || "";
      this.researchHTML = this.teacher.research ? this.teacher.research.split('\n').join('<br>'): "";
      this.researchTXT = this.teacher.research || "";
      this.extractRolesFromTeacher();
      console.log("teacher received to component:", this.teacher);
      this.store.dispatch(new GetStudyGoalsForTeacher(this.studyGoalsIds)).subscribe(() => {
        this.studyGoals = this.studyGoalsIds.map(id => this.store.selectSnapshot(GoalsState.goalById(id)));
        this.joinRolesWithStudyGoals();
      })
    });
    this.showByRolesSubscription = this.showByRoles$.subscribe(show => this.showByRoles = show);
  }

  ngOnDestroy(): void {
    this.showByRolesSubscription.unsubscribe();
  }


  settingsClick() {
    this.dialog.open(SubjectsSettingsDialogComponent);
  }
  
  extractRolesFromTeacher() {
    this.roles = [];
    for (let role of Object.keys(teacherRoleSK)) {
      const subjects = [];
      for (let subj of this.teacher.subjects) {
        if (this.teacher.rolesInSubjects[subj.id].includes(role as TeacherRole)) {
          subjects.push(subj);
        }
      }
      if (subjects.length > 0) {
        this.roles.push({role: teacherRoleSK[role], subjects});
      }
    }
    this.studyGoalsIds = [];
    for (let subj of this.teacher.subjects) {
      this.studyGoalsIds.push(subj.id);
    }
  }

  joinRolesWithStudyGoals() {
    for (let role of this.roles) {
      const goals = [];
      for (let goal of this.studyGoals) {
        if (role.subjects.some(subj => subj.id === goal.id)) {
          goals.push(goal);
        }
      }
      if (goals.length > 0) {
        role.studyGoals = goals;
      }
    }
    console.log('roles: ', this.roles);
  }

  sendUrl() {
    this.store.dispatch(new SaveTeacherUrl(this.teacher.id,this.url)).subscribe(() => {
      this.teacher = this.store.selectSnapshot(TeachersState.teacherById(this.teacherId));
      this.url = this.teacher.personalWebUrl;
    });
  }

  deleteUrl() {
    this.store.dispatch(new RemoveTeacherUrl(this.teacher.id)).subscribe(() => {
      this.teacher = this.store.selectSnapshot(TeachersState.teacherById(this.teacherId));
      this.url = this.teacher.personalWebUrl;
    });
  }

  saveResearch() {
    this.store.dispatch(new SaveTeacherResearch(this.teacher.id,this.researchTXT)).subscribe(() => {
      this.teacher = this.store.selectSnapshot(TeachersState.teacherById(this.teacherId));
      this.researchHTML = this.teacher.research ? this.teacher.research.split('\n').join('<br>'): "";
      this.researchTXT = this.teacher.research || "";
    });
  }

  deleteResearch() {
    this.store.dispatch(new RemoveTeacherResearch(this.teacher.id)).subscribe(() => {
      this.teacher = this.store.selectSnapshot(TeachersState.teacherById(this.teacherId));
      this.researchHTML = this.teacher.research ? this.teacher.research.split('\n').join('<br>'): "";
      this.researchTXT = this.teacher.research || "";
    });
  }

  subjectUrl(subjectId: string) {
    return "/study-goal/" + subjectId.split('/').join('-');
  }
}
