import { Pipe, PipeTransform } from '@angular/core';
import { PersonInSubject, teacherRoleSK } from 'src/entities/teacher';

@Pipe({
  name: 'teacherToString'
})
export class TeacherToStringPipe implements PipeTransform {

  transform(teacher: PersonInSubject): unknown {
    return teacher.fullName + " (" + 
      teacher.roles.map(role => teacherRoleSK[role]).join(', ')
    + ")";
  }

}
