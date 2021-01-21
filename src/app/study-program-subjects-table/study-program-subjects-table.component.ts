import { Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SubjectInStudyPlan } from 'src/entities/study-goal';
import { StudyProgramSettingsState } from 'src/shared/study-program-settings.state';

@Component({
  selector: 'app-study-program-subjects-table',
  templateUrl: './study-program-subjects-table.component.html',
  styleUrls: ['./study-program-subjects-table.component.css']
})
export class StudyProgramSubjectsTableComponent implements OnInit {
  @Input() subjects: SubjectInStudyPlan[];

  @Select(StudyProgramSettingsState.columns) columns$: Observable<string[]>;
  columnsToDisplay: string[];

  constructor() { }

  ngOnInit(): void {
    this.columns$.subscribe(cols => this.columnsToDisplay = cols);    
  }

  subjectUrl(subjectId: string) {
    return "/study-goal/" + subjectId.split('/').join('-');
  }
}
