import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SaveStudyProgramSettings } from 'src/shared/study-program-settings.actions';
import { StudyProgramSettings, StudyProgramSettingsState } from 'src/shared/study-program-settings.state';

@Component({
  selector: 'app-study-program-settings-dialog',
  templateUrl: './study-program-settings-dialog.component.html',
  styleUrls: ['./study-program-settings-dialog.component.css']
})
export class StudyProgramSettingsDialogComponent implements OnInit {

  settings: {name: string, checked:boolean, title:string}[] =[];
  showBlocks: boolean;

  constructor(private dialogRef: MatDialogRef<StudyProgramSettingsDialogComponent>,
              private store: Store) { }

  ngOnInit(): void {
    const allColumns = this.store.selectSnapshot(StudyProgramSettingsState.allColumns);
    const columns = this.store.selectSnapshot(StudyProgramSettingsState.columns);
    const titles = this.store.selectSnapshot(StudyProgramSettingsState.titles);
    this.showBlocks = this.store.selectSnapshot(StudyProgramSettingsState.showBlocks);
    for (let col of allColumns) {
      this.settings.push({name: col, checked: columns.includes(col), title: titles[col]});
    }
  }

  cancelClick() {
    this.dialogRef.close();
  }

  defaultClick() {
    const allColumns = this.store.selectSnapshot(StudyProgramSettingsState.allColumns);
    const defaultSettings = this.store.selectSnapshot(StudyProgramSettingsState.defaultSettings);
    const titles = this.store.selectSnapshot(StudyProgramSettingsState.titles);
    const columns = defaultSettings.columns;
    this.showBlocks = defaultSettings.showBlocks;
    this.settings = [];
    for (let col of allColumns) {
      this.settings.push({name: col, checked: columns.includes(col), title: titles[col]});
    }
  }

  saveClick() {
    const cols = [];
    this.settings.forEach(setting => {
      if (setting.checked)
        cols.push(setting.name);
    })
    this.store.dispatch(new SaveStudyProgramSettings(new StudyProgramSettings(cols, this.showBlocks))).subscribe(
      () => this.dialogRef.close()
    );
  }
}
