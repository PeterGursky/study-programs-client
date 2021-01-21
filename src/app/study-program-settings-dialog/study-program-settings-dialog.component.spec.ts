import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyProgramSettingsDialogComponent } from './study-program-settings-dialog.component';

describe('StudyProgramSettingsDialogComponent', () => {
  let component: StudyProgramSettingsDialogComponent;
  let fixture: ComponentFixture<StudyProgramSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyProgramSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyProgramSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
