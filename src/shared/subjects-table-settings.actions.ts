import { SubjectsTableSettings } from './subjects-table-settings.state';

export class SaveSubjectsTableSettings {
  static readonly type= "[SubjectsTableSettingsDialog] save settings";
  constructor(public settings: SubjectsTableSettings){}
}