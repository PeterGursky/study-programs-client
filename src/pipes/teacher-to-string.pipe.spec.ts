import { TeacherToStringPipe } from './teacher-to-string.pipe';

describe('TeacherToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new TeacherToStringPipe();
    expect(pipe).toBeTruthy();
  });
});
