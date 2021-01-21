import { StudyGoalName } from "./study-goal";

export type TeacherRole = 'P' | 'C' | 'A' | 'G' | 'H' | 'S' | 'V' | 'L';

export const teacherRoleSK = {
  P: "prednášajúci",
	C: "cvičiaci",
	A: "administrátor",
	G: "garant predmetu",
	H: "hodnotiaci",
	S: "skúšajúci",
	V: "vedúci seminára",
	L: "laborant" 
}

export class PersonInSubject {
  constructor(
    public id: number,
    public fullName: string,
    public lastName: string,
    public roles: TeacherRole[]
  ){}
}

export class Teacher {
  constructor(
    public id: number,
    public fullName: string,
    public lastName: string,
    public personalWebUrl: string,
    public research: string,
    public rolesInSubjects: {[subjectId: string]: TeacherRole[]},
    public subjects: StudyGoalName[]
  ){}
}