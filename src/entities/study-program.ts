import { SubjectInStudyPlan } from './study-goal';
import { StudyGoalName } from './study-goal';

export type StudyPlanBlockType  = 'COMPULSORY' | 'COMPULSORY_ELECTIVE' | 'ELECTIVE';
export const studyPlanBlockTypeSK = {
  COMPULSORY: 'Povinné predmety',
  COMPULSORY_ELECTIVE: 'Povinne voliteľné predmety',
  ELECTIVE: 'Výberové predmety'
}

export class StudyPlanBlock {
  constructor(
    public minCredits: number,
    public blockType: StudyPlanBlockType,
    public blockName: string,
    public blockAbbreviation: string,
    public subjects: SubjectInStudyPlan[]
  ){}
}

export class StudyPlanPart {
  constructor(
    public type: string,
    public typeName: string,
    public minCredits: number,
    public minCreditsCompulsoryElective: number,
    public studyBlocks: StudyPlanBlock[]
  ){}
}

export type StudyLevelType = 'I.' | 'II.' | 'III.' | 'N' | string; // N (neurčený stupeň)

export class StudyPlan {
  constructor(
    public code: string,
    public year: string,
    public shortName: string,
    public name: string,
    public level: StudyLevelType,
    public faculty: string,
    public facultyAbbreviation: string,
    public studyParts: StudyPlanPart[]
  ){}
}

export class StudyProgram {
  constructor(
    public id: string,
    public plan: StudyPlan,
    public fieldsOfExpertise: StudyGoalName[]
  ){}
}

export class StudyProgramInSubject {
  constructor(
    public studyProgram: string,
    public blockType: StudyPlanBlockType,
    public blockName: string,
    public yearsOfStudy: string,
    public programLevel: StudyLevelType
  ) {}
}