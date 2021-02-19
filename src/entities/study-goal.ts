import { StudyProgramInSubject } from './study-program';
import { PersonInSubject } from './teacher';

export type StudyGoalType  = 'SUBJECT' | 'FIELD_OF_EXPERTISE';

export class StudyGoalName {
  constructor(
    public id: string,
    public name: string,
    public type: StudyGoalType
  ) {}
}

export class SubjectInStudyPlan {
  constructor(
    public id: number,
    public stringId: string,
    public name: string,
    public nameAbbreviation: string,
    public credits: number,
    public length: string,
    public evaluation: SubjectEvaluationType,
    public suggestedYears: string,
    public semester: string,
    public teachers: PersonInSubject[],
    public languages: string[],
    public languagesString: string,
    public prerequisites: string[],
    public prerequisitesString: string,
    public excluding: string,
    public alternatives: string
    ) {}
}

export type SubjectType = "B" | "S" | "O" | "Z"
export const subjectTypeSK = {
  B: "bežný predmet",
  S: "predmet štátnej skúšky",
  O: "štátna skúška - obhajoba",
  Z: "záverečná práca"
}
export type SubjectEvaluationType = "A" | "C" | "S" | "Z" | "ZS" | "KZ" | "P" | "PaS" | "H";
export const subjectEvaluationTypeSK = {
  A: "Absolvovanie",
	C: "Hodnotenie",
	H: "Hodnotenie",
	S: "Skúška",
	Z: "Zápočet",
	ZS: "Zápočet a skúška",
	KZ: "klasifikovaný zápočet",
	P: "Priebežné hodnotenie / Prax",
	PaS: "Priebežné hodnotenie so skúškou" 
}

export type SubjectTextType = "C" | "L" | "O" | "P" | "PA" | "PJ" | "S" | "SO" | "VV" | "Z" | "PZ" | "ON" | "VH";
export const subjectTextTypeSK = {
  S: "Sylabus predmetu",
  SO: "Stručná osnova predmetu", 
  VV: "Výsledky vzdelávania",
  L: "Odporúčaná literatúra", 
  PA: "Podmienky na absolvovanie predmetu",
  C: "Cieľ",
  O: "Obsahová prerekvizita",
  P: "Priebežné hodnotenie",
  PJ: "Jazyk, ktorého znalosť je potrebná na absolvovanie predmetu", 
  Z: "Záverečné hodnotenie", 
  PZ: "Poznámky",
  ON: "Obsahová náplň štátnicového predmetu",
  VH: "Váha hodnotenia predmetu (priebežné/záverečné)"
}

export class SubjectInInfList {
  constructor(
    public id: number,
    public stringId: string,
    public type: SubjectType,
    public name: string,
    public nameAbbreviation: string,
    public credits: number,
    public length: string,
    public evaluation: SubjectEvaluationType,
    public suggestedYears: string,
    public semester: string,
    public teachers: PersonInSubject[],
    public languages: string[],
    public languagesString: string,
    public prerequisites: StudyGoalName[],
    public prerequisitesString: string,
    public excluding: StudyGoalName[],
    public excludingString: string,
    public alternatives: StudyGoalName[],
    public alternativesString: string,
    public studyProgramsNames: string[],
    public studyPrograms: StudyProgramInSubject[],
    public texts: Map<SubjectTextType, string>
    ) {}
}

export class StudyGoal {
  constructor(
    public id: string,
    public name: string,
    public type: StudyGoalType,
    /* Map from StudyGoalName to text that describes how the StudyGoal in key influences 
       the StudyGoal presented in this object. Its a text of content prerequisite. */
    public requirements: {[subjectId: string]: string},
    public prerequisities: StudyGoalName[],
    public following: StudyGoalName[],
    public inStudyPrograms: {[subjectId: string]: StudyProgramInSubject[]},
    public description: string,
    /* text about all prerequisities including high school */
    public contentPrerequisities: string,
    public url: string,
    /* for fields of expersise like SOFTWARE DEVELOPER, DATAMINER, SECURITY EXPERT  */
    public studyProgramId?: string,
    /* for real subjects */
    public ais?: SubjectInInfList
  ) {}
}

export interface TaggedStudyGoal {
  id: string,
  name: string,
  goal: StudyGoal,
  aisRelative: boolean
}

export interface TaggedStudyGoalNode {
  id: string,
  name: string,
  goal: StudyGoal,
  aisRelative: boolean,
  children: TaggedStudyGoalNode[]
}

export class StudyGoalRequirement {
  constructor(public studyGoalId: string, public requiredKnowledge: string){}
}