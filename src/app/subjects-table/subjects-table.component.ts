import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { StudyGoal } from 'src/entities/study-goal';
import { SubjectsTableSettingsState } from 'src/shared/subjects-table-settings.state';
import { subjectTextTypeSK } from 'src/entities/study-goal'; 

@Component({
  selector: 'app-subjects-table',
  templateUrl: './subjects-table.component.html',
  styleUrls: ['./subjects-table.component.css']
})
export class SubjectsTableComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit  {
  @Input() subjects: StudyGoal[];

  @Select(SubjectsTableSettingsState.columns) columns$: Observable<string[]>;

  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource();
  
  columnsSubscription: Subscription;
  columnsToDisplay: string[];
  computed = {};
  subjectColor = {
    COMPULSORY: 'primary',
    COMPULSORY_ELECTIVE: 'accent',
    ELECTIVE: 'basic'
  }
  subjectTextTypeSK = subjectTextTypeSK;

  constructor() { }

  ngOnInit(): void {
    this.columnsSubscription = this.columns$.subscribe(cols => this.columnsToDisplay = cols);    
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data: StudyGoal, headerId: string) => {
      switch (headerId) {
        case "id": return data.id;
        case "name": return data.name;
        case "credits": return data.ais.credits;
        case "length": return data.ais.length;
        case "evaluation": return data.ais.evaluation;
        case "programLevels": return this.computed[data.id].programLevels;
        case "semester": return data.ais.semester;
        case "prerequisitesString": return data.ais.prerequisitesString.length;
        case "teachers": return data.ais.teachers.length;
        default:
          return data[headerId];
      }
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.subjects) {
      this.computed = {}
      for(let subj of this.subjects) {
        let programLevels = subj.ais!.studyPrograms!.
                            reduce((acc, program) => 
                                acc.includes(program.programLevel) ? acc : [...acc, program.programLevel],[]) || [];
        programLevels.sort();
        let inPrograms = [...subj.ais.studyPrograms].sort( (a,b) => {
          const a1 = a.blockType === 'COMPULSORY' ? 1 : a.blockType === 'COMPULSORY_ELECTIVE' ? 2 : 3;
          const b1 = b.blockType === 'COMPULSORY' ? 1 : b.blockType === 'COMPULSORY_ELECTIVE' ? 2 : 3;
          if (a1 < b1) return -1;
          if (a1 > b1) return 1;
          if (a.blockName < b.blockName) return -1;
          if (a.blockName > b.blockName) return 1;
          return 0;
        });
        let texts = {};
        for (let key of Object.keys(subjectTextTypeSK)) {
          texts[key] = ({ length: 0, color: this.textLengthColor(key, 0)})
        }
        for (let text of Object.entries(subj.ais.texts)) {
          texts[text[0]] = ({
            length : this.textLength(text[1]),
            color: this.textLengthColor(text[0], this.textLength(text[1]))
          });
        }
        this.computed[subj.id] = {
          programLevels: programLevels.join(", "),
          inPrograms,
          texts
        }
      }
      const sortedsubjects = [...this.subjects].sort((a,b) => {
        if (this.computed[a.id].programLevels < this.computed[b.id].programLevels) return -1;
        if (this.computed[a.id].programLevels > this.computed[b.id].programLevels) return 1;
        if (a.ais.semester > b.ais.semester) return -1;
        if (b.ais.semester < a.ais.semester) return 1;
        if (a.ais.teachers.length < b.ais.teachers.length) return -1;
        if (a.ais.teachers.length > b.ais.teachers.length) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      this.dataSource.data = sortedsubjects;
    }
  }
  
  textLength(str: string): number {
    return str.trim().length;
  }

  textLengthColor(textId: string, length: number) {
    switch (textId) {
      case 'SO': return length > 120 ? 'green_text' : length > 20 ? 'yellow_text': 'red_text'
      case 'VV': return length > 150 ? 'green_text' : length > 20 ? 'yellow_text': 'red_text'
      case 'L': return length > 120 ? 'green_text' : length > 40 ? 'yellow_text': 'red_text'
      case 'PJ': return length > 10 ? 'green_text' : 'red_text'
      case 'PA': return length > 10 ? 'green_text' : length > 0 ? 'yellow_text': 'red_text'
      default:
        return 'black_text';
    }
  }
 
  ngOnDestroy(): void {
    this.columnsSubscription.unsubscribe();
  }

  subjectUrl(subjectId: string) {
    return "/study-goal/" + subjectId.split('/').join('-');
  }

}
