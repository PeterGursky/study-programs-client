import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StudyGoalComponent } from './study-goal/study-goal.component';
import { StudyProgramComponent } from './study-program/study-program.component';
import { StudyProgramsComponent } from './study-programs/study-programs.component';
import { TeacherComponent } from './teacher/teacher.component';

const routes: Routes = [
  {path: "study-goal/:id", component: StudyGoalComponent},
  {path: "study-program/:id", component: StudyProgramComponent},
  {path: "teacher/:id", component: TeacherComponent},
  {path: "login", component: LoginComponent},
  {path: "", component: StudyProgramsComponent},
//  {path: "**", redirectTo: "/"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
