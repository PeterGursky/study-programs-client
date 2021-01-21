import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SaveSubjectsTableSettings } from 'src/shared/subjects-table-settings.actions';
import { SubjectsTableSettingsState, SubjectsTableSettings } from 'src/shared/subjects-table-settings.state';

@Component({
  selector: 'app-subjects-settings-dialog',
  templateUrl: './subjects-settings-dialog.component.html',
  styleUrls: ['./subjects-settings-dialog.component.css']
})
export class SubjectsSettingsDialogComponent implements OnInit {

  settings: {name: string, checked:boolean, title:string}[] =[];
  showByRoles:boolean;

  constructor(private dialogRef: MatDialogRef<SubjectsSettingsDialogComponent>,
              private store: Store) { }

  ngOnInit(): void {
    const allColumns = this.store.selectSnapshot(SubjectsTableSettingsState.allColumns);
    const columns = this.store.selectSnapshot(SubjectsTableSettingsState.columns);
    const titles = this.store.selectSnapshot(SubjectsTableSettingsState.titles);
    this.showByRoles = this.store.selectSnapshot(SubjectsTableSettingsState.showByRoles);
    for (let col of allColumns) {
      this.settings.push({name: col, checked: columns.includes(col), title: titles[col]});
    }
  }

  cancelClick() {
    this.dialogRef.close();
  }

  defaultClick() {
    const allColumns = this.store.selectSnapshot(SubjectsTableSettingsState.allColumns);
    const defaultSettings = this.store.selectSnapshot(SubjectsTableSettingsState.defaultSettings);
    const titles = this.store.selectSnapshot(SubjectsTableSettingsState.titles);
    const columns = defaultSettings.columns;
    this.showByRoles = defaultSettings.showByRoles;
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
    this.store.dispatch(new SaveSubjectsTableSettings(new SubjectsTableSettings(cols, this.showByRoles))).subscribe(
      () => this.dialogRef.close()
    );
  }

}
