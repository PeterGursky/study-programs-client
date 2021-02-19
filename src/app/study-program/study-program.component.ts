import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { StudyGoalName, SubjectInStudyPlan } from 'src/entities/study-goal';
import { StudyProgram, StudyPlanBlockType, StudyPlanPart } from 'src/entities/study-program';
import { AuthState } from 'src/shared/auth.state';
import { AddFieldOfExpertise, GetStudyProgram, RemoveFieldOfExpertise } from 'src/shared/programs.actions';
import { ProgramsState } from 'src/shared/programs.state';
import { StudyProgramSettingsState } from 'src/shared/study-program-settings.state';
import { StudyProgramSettingsDialogComponent } from '../study-program-settings-dialog/study-program-settings-dialog.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-study-program',
  templateUrl: './study-program.component.html',
  styleUrls: ['./study-program.component.css']
})
export class StudyProgramComponent implements OnInit {

  program:StudyProgram;
  programId:string;
  sc_compulsory: SubjectInStudyPlan[];
  sc_compulsory_elective: SubjectInStudyPlan[];
  sc_elective: SubjectInStudyPlan[];
  ss_compulsory: SubjectInStudyPlan[];
  ss_compulsory_elective: SubjectInStudyPlan[];
  ss_elective: SubjectInStudyPlan[];
  editing = false;
  showAddFoeFormField = false;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fieldsOfExpertise = [];

  @Select(StudyProgramSettingsState.showBlocks) showBlocks$: Observable<boolean>;
  @Select(AuthState.username) userName$: Observable<string>;

  constructor(private route: ActivatedRoute, 
              private store: Store, 
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.params.pipe(
          map(params => this.programId = params.id),
          tap(id => console.log('idem po stufy goal s id ', id)),
          switchMap(id => this.store.dispatch(new GetStudyProgram(id))))
      .subscribe(() => {
        this.processProgramFromServer();
        this.extractStudyParts();
      });
  }

  processProgramFromServer() {
    this.program = this.store.selectSnapshot(ProgramsState.programById(this.programId));
    this.fieldsOfExpertise = [...this.program.fieldsOfExpertise];
    console.log("study program received to component:", this.program);
  }

  settingsClick() {
    this.dialog.open(StudyProgramSettingsDialogComponent);
  }

  extractStudyParts() {
    for (let studyPart of this.program.plan.studyParts) {
      if (studyPart.type == 'SC') {
        this.sc_compulsory = this.extractBlocks("COMPULSORY", studyPart);
        this.sc_compulsory_elective = this.extractBlocks("COMPULSORY_ELECTIVE", studyPart);
        this.sc_elective = this.extractBlocks("ELECTIVE", studyPart);
      } else {
        this.ss_compulsory = this.extractBlocks("COMPULSORY", studyPart);
        this.ss_compulsory_elective = this.extractBlocks("COMPULSORY_ELECTIVE", studyPart);
        this.ss_elective = this.extractBlocks("ELECTIVE", studyPart);
      }
    }
  }

  extractBlocks(type: StudyPlanBlockType, studyPart: StudyPlanPart): SubjectInStudyPlan[] {
    let result = studyPart.studyBlocks
            .filter(block => block.blockType === type)
            .flatMap(block => block.subjects)
    result = this.removeDuplicities(result)
            .sort((a,b) => {
              if (a.suggestedYears.trim().length == 0 && b.suggestedYears.trim().length > 0) return 1;
              if (a.suggestedYears.trim().length > 0 && b.suggestedYears.trim().length == 0) return -1;
              if (a.suggestedYears.trim().length > 0 && b.suggestedYears.trim().length > 0) {
                if (a.suggestedYears < b.suggestedYears) return -1;
                if (a.suggestedYears > b.suggestedYears) return 1;
              }
              if (a.semester > b.semester) return -1;
              if (a.semester < b.semester) return 1;
              if (a.credits > b.credits) return -1;
              if (a.credits < b.credits) return 1;
              return 0;
            }); 
    return result.length == 0 ? null : result;
  }

  removeDuplicities(subjects: SubjectInStudyPlan[]): SubjectInStudyPlan[] {
    return subjects.reduce((list, value) => list.some(sub => sub.id === value.id) ? list : [...list, value], []);
  }

  addFOE(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.store.dispatch(new AddFieldOfExpertise(this.programId, value)).subscribe(()=> {
        event.input.value = "";
        this.processProgramFromServer();
      });
    }
  }

  removeFOE(foe: StudyGoalName) {
    console.log("vymazanie ", foe);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: "Zmazanie uplatnenia" , message: "Naozaj zmazať uplatnenie " + foe.name + " ?"}
    });
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.store.dispatch(new RemoveFieldOfExpertise(this.programId, foe.id)).subscribe(()=> {
          this.processProgramFromServer();
        });
      }
    });
  }

  subjectUrl(subjectId: string) {
    return subjectId ? "/study-goal/" + subjectId.split('/').join('-') : "";
  }
}
