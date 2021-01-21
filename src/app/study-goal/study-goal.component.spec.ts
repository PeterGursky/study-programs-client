import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyGoalComponent } from './study-goal.component';

describe('StudyGoalComponent', () => {
  let component: StudyGoalComponent;
  let fixture: ComponentFixture<StudyGoalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyGoalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
