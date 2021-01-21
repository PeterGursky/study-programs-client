import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyProgramSubjectsTableComponent } from './study-program-subjects-table.component';

describe('StudyProgramSubjectsTableComponent', () => {
  let component: StudyProgramSubjectsTableComponent;
  let fixture: ComponentFixture<StudyProgramSubjectsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyProgramSubjectsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyProgramSubjectsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
