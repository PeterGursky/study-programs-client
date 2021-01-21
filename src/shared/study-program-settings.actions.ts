import { StudyProgramSettings } from './study-program-settings.state';

export class SaveStudyProgramSettings {
  static readonly type= "[StudyProgramSettingsDialog] save settings";
  constructor(public settings: StudyProgramSettings){}
}