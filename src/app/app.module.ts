import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { StudyProgramsComponent } from './study-programs/study-programs.component';
import { MaterialModule } from 'src/modules/material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { LoginComponent } from './login/login.component';
import { NgxsModule } from '@ngxs/store'; 
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin'; 
import { AuthState } from 'src/shared/auth.state';
import { environment } from 'src/environments/environment';
import { StudyProgramComponent } from './study-program/study-program.component';
import { StudyGoalComponent } from './study-goal/study-goal.component';
import { TeacherComponent } from './teacher/teacher.component';
import { ProgramsState } from 'src/shared/programs.state';
import { StudyProgramSubjectsTableComponent } from './study-program-subjects-table/study-program-subjects-table.component';
import { TeacherToStringPipe } from '../pipes/teacher-to-string.pipe';
import { StudyProgramSettingsDialogComponent } from './study-program-settings-dialog/study-program-settings-dialog.component';
import { StudyProgramSettingsState } from 'src/shared/study-program-settings.state';
import { GoalsState } from 'src/shared/goals.state';
import { TeachersState } from 'src/shared/teachers.state';
import { SubjectsTableComponent } from './subjects-table/subjects-table.component';
import { SubjectsSettingsDialogComponent } from './subjects-settings-dialog/subjects-settings-dialog.component';
import { SubjectsTableSettingsState } from 'src/shared/subjects-table-settings.state';
import { RelevantStudyGoalsTableComponent } from './relevant-study-goals-table/relevant-study-goals-table.component';
import { RelevantStudyGoalsTreeComponent } from './relevant-study-goals-tree/relevant-study-goals-tree.component';


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    StudyProgramsComponent,
    ConfirmDialogComponent,
    LoginComponent,
    StudyProgramComponent,
    StudyGoalComponent,
    TeacherComponent,
    StudyProgramSubjectsTableComponent,
    TeacherToStringPipe,
    StudyProgramSettingsDialogComponent,
    SubjectsTableComponent,
    SubjectsSettingsDialogComponent,
    RelevantStudyGoalsTableComponent,
    RelevantStudyGoalsTreeComponent
  ],
  imports: [
    NgxsModule.forRoot([AuthState, ProgramsState, GoalsState, TeachersState, StudyProgramSettingsState, SubjectsTableSettingsState], {
      developmentMode: ! environment.production,
      selectorOptions: {
        suppressErrors: false,
        injectContainerState: false
      }
    }),
    NgxsStoragePluginModule.forRoot({
      key: ["auth.name", 
            "auth.password", 
            "studyProgramsSettings.settingsString",
            "subjectsTableSettings.settingsString",
          ]
    }), 
    NgxsReduxDevtoolsPluginModule.forRoot(),
    BrowserModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
