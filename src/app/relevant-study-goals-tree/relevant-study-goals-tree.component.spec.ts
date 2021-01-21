import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevantStudyGoalsTreeComponent } from './relevant-study-goals-tree.component';

describe('RelevantStudyGoalsTreeComponent', () => {
  let component: RelevantStudyGoalsTreeComponent;
  let fixture: ComponentFixture<RelevantStudyGoalsTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelevantStudyGoalsTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelevantStudyGoalsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
