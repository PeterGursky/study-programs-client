import { StudyGoalName } from "src/entities/study-goal";

export class GetStudyProgram {
  static readonly type= "[StudyProgram Component] get study program by id";
  constructor(public id: string){}
}

export class AddFieldOfExpertise {
  static readonly type = "[StudyProgram Component] add field of expertise";
  constructor(public programId: string, public expertiseName: string) {}
}

export class RemoveFieldOfExpertise {
  static readonly type = "[StudyProgram Component] remove field of expertise";
  constructor(public programId: string, public foeId: string) {}
}