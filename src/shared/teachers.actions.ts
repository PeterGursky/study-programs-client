export class GetTeacher {
  static readonly type= "[Teacher Component] get teacher by id";
  constructor(public id: string){}
}

export class SaveTeacherUrl {
  static readonly type = "[Teacher Component] save teacher's url";
  constructor(public teacherId: number, public url: string) {}
}

export class RemoveTeacherUrl {
  static readonly type = "[Teacher Component] remove teacher's url";
  constructor(public teacherId: number) {}
}

export class SaveTeacherResearch {
  static readonly type = "[Teacher Component] save teacher's research";
  constructor(public teacherId: number, public research: string) {}
}

export class RemoveTeacherResearch {
  static readonly type = "[Teacher Component] remove teacher's research";
  constructor(public teacherId: number) {}
}