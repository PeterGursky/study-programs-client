import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevantStudyGoalsTableComponent } from './relevant-study-goals-table.component';

describe('RelevantStudyGoalsTableComponent', () => {
  let component: RelevantStudyGoalsTableComponent;
  let fixture: ComponentFixture<RelevantStudyGoalsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelevantStudyGoalsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelevantStudyGoalsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
