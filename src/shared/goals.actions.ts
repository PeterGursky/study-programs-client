import { StudyGoalRequirement } from 'src/entities/study-goal';

export class GetStudyGoal {
  static readonly type= "[StudyGoal Component] get study goal by id";
  constructor(public id: string){}
}

export class GetStudyGoalsForTeacher {
  static readonly type= "[Teacher Component] get study goals by ids";
  constructor(public ids: string[]){}
}

export class GetStudyGoalsForStudyGoal {
  static readonly type= "[StudyGoal Component] get study goals by ids";
  constructor(public ids: string[]){}
}

export class ReloadStudyGoals {
  static readonly type= "[StudyGoal Component] reload study goals by ids";
  constructor(public ids: string[]){}
}

export class ChangeStudyGoalUrl {
  static readonly type = "[StudyGoal Component] change study goal URL";
  constructor(public goalId: string, public url: string){}
}

export class RemoveStudyGoalUrl {
  static readonly type = "[StudyGoal Component] remove study goal URL";
  constructor(public goalId: string){}
}

export class SaveStudyGoalDescription {
  static readonly type = "[StudyGoal Component] change study goal description";
  constructor(public goalId: string, public description: string){}
}

export class RemoveStudyGoalDescription {
  static readonly type = "[StudyGoal Component] remove study goal description";
  constructor(public goalId: string){}
}

export class SaveStudyGoalRequirement {
  static readonly type = "[RelevantStudyGoalsTable Component] save study goal requirement";
  constructor(public goalId: string, public requirement: StudyGoalRequirement){}
}

export class RemoveStudyGoalRequirement {
  static readonly type = "[RelevantStudyGoalsTable Component] remove study goal requirement";
  constructor(public goalId: string, public requirementId: string){}
}