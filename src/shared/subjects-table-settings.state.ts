import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SaveSubjectsTableSettings } from './subjects-table-settings.actions';

export class SubjectsTableSettings {
  constructor(
    public columns: string[],
    public showByRoles: boolean,
    ){}
}

const ALL_COLUMNS = ["id", "name", "credits", "length","evaluation",
                     "programLevels", "semester", "text_SO", "text_VV", "text_L", "text_PJ", "text_PA", "text_PZ",
                     "inStudyPrograms", "prerequisitesString", "teachers"];
const DEFAULT_COLUMNS = ["id", "name", "credits", "length", "evaluation",
                     "programLevels", "semester", "inStudyPrograms"];
const DEFAULT_SETTINGS = new SubjectsTableSettings(DEFAULT_COLUMNS, true);                     
const DEFAULT_SETTINGS_STRING = JSON.stringify(DEFAULT_SETTINGS);

export interface SubjectsTableSettingsModel {
  settings: SubjectsTableSettings,
  settingsString: string
}

@State<SubjectsTableSettingsModel>({
  name: 'subjectsTableSettings',
  defaults: {
    settings: DEFAULT_SETTINGS,
    settingsString: DEFAULT_SETTINGS_STRING
  }
})
@Injectable()
export class SubjectsTableSettingsState {
  @Selector()
  static titles(_state: SubjectsTableSettingsModel): { [column: string]: string } {
    return {
      "id": "skratka", 
      "name": "názov", 
      "credits": "kredity", 
      "length": "rozsah",
      "evaluation": "ukončenie",
      "programLevels": "stupeň štúdia",
      "semester": "semester", 
      "text_SO": "stručná osnova predmetu - dĺžka textu", 
      "text_VV": "výsledky vzdelávania - dĺžka textu", 
      "text_L": "odporúčaná literatúra - dĺžka textu", 
      "text_PJ": "jazyk predmetu - dĺžka textu", 
      "text_PA": "podmienky na absolvovanie predmetu - dĺžka textu", 
      "text_PZ": "poznámky - dĺžka textu",
      "inStudyPrograms": "v študijných programoch",
      "prerequisitesString": "podmieňujúce prerekvizity", 
      "teachers": "vyučujúci"
    }
  }

  @Selector()
  static columns(state: SubjectsTableSettingsModel): string[] {
    return state.settings.columns;
  }

  @Selector()
  static allColumns(_state: SubjectsTableSettingsModel): string[] {
    return ALL_COLUMNS;
  }

  @Selector()
  static defaultSettings(_state: SubjectsTableSettingsModel):SubjectsTableSettings {
    return DEFAULT_SETTINGS;
  }

  @Selector()
  static showByRoles(state: SubjectsTableSettingsModel): boolean {
    return state.settings.showByRoles;
  }

  ngxsOnInit(ctx: StateContext<SubjectsTableSettingsModel>) {
    ctx.setState(state => ({
      settingsString :state.settingsString,
      settings: JSON.parse(state.settingsString)
    }))
  }

  @Action(SaveSubjectsTableSettings)
  saveColumns(ctx: StateContext<SubjectsTableSettingsModel>, action: SaveSubjectsTableSettings) {
    ctx.setState({
      settings: action.settings,
      settingsString: JSON.stringify(action.settings)
    });
  }
}