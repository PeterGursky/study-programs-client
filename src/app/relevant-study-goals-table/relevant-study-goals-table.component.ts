import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { StudyGoal, StudyGoalRequirement, TaggedStudyGoal } from 'src/entities/study-goal';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SearchResult } from 'src/entities/search-result';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { ServerService } from 'src/services/server.service';
import { Store } from '@ngxs/store';
import { GetStudyGoal, SaveStudyGoalRequirement } from 'src/shared/goals.actions';
import { GoalsState } from 'src/shared/goals.state';

interface TableRow {
  id: string,
  name: string,
  available: boolean,
  aisRelative: boolean,
  VV: string,
  requirements: string,
  reqHTML:string;
}

@Component({
  selector: 'app-relevant-study-goals-table',
  templateUrl: './relevant-study-goals-table.component.html',
  styleUrls: ['./relevant-study-goals-table.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RelevantStudyGoalsTableComponent implements OnChanges {
  @Input() mainStudyGoal: StudyGoal;
  @Input() following: TaggedStudyGoal[];
  @Input() fieldsOfExpertise: TaggedStudyGoal[];
  @Input() prerequisities: TaggedStudyGoal[];
  @Input() editing: boolean;
  @Output() goalChanged = new EventEmitter<StudyGoal>();

//  columnsToShow: string[] = ["id", "name", "VV", "requirements"];
  columnsToShow: string[] = ["id", "name", "VV"];
  tableData: TableRow[] = [];
  searchOptions: Observable<SearchResult[]>;

  searchForm = new FormGroup({
    searchField: new FormControl('')
  }); 

  constructor(private serverService: ServerService, private store: Store) { }
  get reqColName() {
    if (this.following) return "v tomto predmete sa využije";
    if (this.prerequisities) return "očakáva sa z tohto predmetu";
    if (this.fieldsOfExpertise) return "pre toto zameranie poskytuje"
    return "";
  }
  
  ngOnChanges(_changes: SimpleChanges): void {
    this.tableData = [];
    let hasRequirements = false;
    if ((this.following || this.fieldsOfExpertise) && this.mainStudyGoal) {
      const toIterate = this.following ? this.following : this.fieldsOfExpertise;
      for (let goal of toIterate) {
        const requirements = goal.goal ? goal.goal.requirements[this.mainStudyGoal.id] : "";
        if (requirements) hasRequirements = true;
        this.tableData.push({
          id: goal.id,
          name: goal.name,
          available: goal.goal ? true : false,
          aisRelative: goal.aisRelative,
          VV: goal.goal && goal.goal.ais ? goal.goal.ais.texts['VV'] : "",
          requirements,
          reqHTML: requirements ? requirements.split('\n').join('<br>'): ""
        });
      }
    } else {
      if (this.prerequisities && this.mainStudyGoal) {
        for (let goal of this.prerequisities) {
          const requirements = this.mainStudyGoal.requirements[goal.id];
          if (requirements) hasRequirements = true;
          this.tableData.push({
            id: goal.id,
            name: goal.name,
            available: goal.goal ? true : false,
            aisRelative: goal.aisRelative,
            VV: goal.goal && goal.goal.ais ? goal.goal.ais.texts['VV'] : "",
            requirements,
            reqHTML: requirements ? requirements.split('\n').join('<br>'): ""
          });
        }
      }  
    }
    if (this.fieldsOfExpertise) {
      this.columnsToShow = ["id", "requirements"];
    } else {
      this.columnsToShow = hasRequirements || this.editing ? ["id", "name", "VV", "requirements"] : ["id", "name", "VV"];
    }
    if (!this.searchOptions) {
      this.searchOptions = this.searchField!.valueChanges
        .pipe(
          startWith(''),
          switchMap(value => this.getResultSubjects(value))
        );
    }    
  }

  get searchField(): FormControl {
   return this.searchForm.get('searchField') as FormControl;
  }

  private getResultSubjects(searchString: string): Observable<SearchResult[]> {
    if (searchString) {
      return this.serverService.search(searchString, "STUDY_GOAL").pipe(
        tap(data => console.log('subject search results', data)),
        map(data => {
          const forbidden = [...this.mainStudyGoal.prerequisities, ...this.mainStudyGoal.following];
          if (forbidden) {
            return data.filter( found => ! Object.keys(forbidden).includes(found.refId));
          } else {
            return data;
          }
        })
      );
    }
    return of([]);
  }

  displayResult(result: SearchResult) {
    return result && result.description ? result.description : "";
  }

  subjectUrl(subjectId: string) {
    return "/study-goal/" + subjectId.split('/').join('-');
  }

  selected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value as SearchResult;
    this.store.dispatch(new GetStudyGoal(value.refId))
    .subscribe(() => {
      const goal = this.store.selectSnapshot(GoalsState.goalById(value.refId));
      this.tableData = [...this.tableData, {
        id: goal.id,
        name: goal.name,
        aisRelative: false,
        available: true,
        VV: goal.ais ? goal.ais.texts['VV'] : "",
        requirements: "",
        reqHTML: ""
      }];
      this.searchField.setValue('');
    });
  }

  saveRequirement(subject: TableRow) {
    this.store.dispatch(new SaveStudyGoalRequirement(this.mainStudyGoal.id,new StudyGoalRequirement(subject.id, subject.requirements))).subscribe(() => {
      const studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.mainStudyGoal.id));
      this.goalChanged.emit(studyGoal);
    });
  }
}
