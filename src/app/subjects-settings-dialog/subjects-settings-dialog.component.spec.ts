import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectsSettingsDialogComponent } from './subjects-settings-dialog.component';

describe('SubjectsSettingsDialogComponent', () => {
  let component: SubjectsSettingsDialogComponent;
  let fixture: ComponentFixture<SubjectsSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectsSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectsSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
