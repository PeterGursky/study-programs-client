import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SaveStudyProgramSettings } from './study-program-settings.actions';

export class StudyProgramSettings {
  constructor(
    public columns: string[],
    public showBlocks: boolean
    ){}
}

const ALL_COLUMNS = ["stringId", "name", "credits", "length","evaluation",
                     "suggestedYears", "semester", "prerequisitesString", "teachers"];
const DEFAULT_COLUMNS = ["stringId", "name", "credits", "length","evaluation",
                     "suggestedYears", "semester"];
const DEFAULT_SETTINGS = new StudyProgramSettings(DEFAULT_COLUMNS, false);                     
const DEFAULT_SETTINGS_STRING = JSON.stringify(DEFAULT_SETTINGS);

export interface StudyProgramSettingsModel {
  settings: StudyProgramSettings,
  settingsString: string
}

@State<StudyProgramSettingsModel>({
  name: 'studyProgramsSettings',
  defaults: {
    settings: DEFAULT_SETTINGS,
    settingsString: DEFAULT_SETTINGS_STRING
  }
})
@Injectable()
export class StudyProgramSettingsState {
  @Selector()
  static titles(_state: StudyProgramSettingsModel): { [column: string]: string } {
    return {
      "stringId": "skratka", 
      "name": "názov", 
      "credits": "kredity", 
      "length": "rozsah",
      "evaluation": "ukončenie",
      "suggestedYears": "odporúčaný ročník", 
      "semester": "semester", 
      "prerequisitesString": "podmieňujúce prerekvizity", 
      "teachers": "vyučujúci"
    }
  }

  @Selector()
  static columns(state: StudyProgramSettingsModel): string[] {
    return state.settings.columns;
  }

  @Selector()
  static allColumns(_state: StudyProgramSettingsModel): string[] {
    return ALL_COLUMNS;
  }

  @Selector()
  static defaultSettings(_state: StudyProgramSettingsModel):StudyProgramSettings {
    return DEFAULT_SETTINGS;
  }

  @Selector()
  static showBlocks(state: StudyProgramSettingsModel): boolean {
    return state.settings.showBlocks;
  }

  ngxsOnInit(ctx: StateContext<StudyProgramSettingsModel>) {
    ctx.setState(state => ({
      settingsString :state.settingsString,
      settings: JSON.parse(state.settingsString)
    }))
  }

  @Action(SaveStudyProgramSettings)
  saveColumns(ctx: StateContext<StudyProgramSettingsModel>, action: SaveStudyProgramSettings) {
    ctx.setState({
      settings: action.settings,
      settingsString: JSON.stringify(action.settings)
    });
  }
}