import { NestedTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Store } from '@ngxs/store';
import { StudyGoal, TaggedStudyGoalNode } from 'src/entities/study-goal';
import { ServerService } from 'src/services/server.service';
import { RemoveStudyGoalRequirement } from 'src/shared/goals.actions';
import { GoalsState } from 'src/shared/goals.state';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-relevant-study-goals-tree',
  templateUrl: './relevant-study-goals-tree.component.html',
  styleUrls: ['./relevant-study-goals-tree.component.css']
})
export class RelevantStudyGoalsTreeComponent implements OnChanges {
  @Input() mainStudyGoal: StudyGoal;
  @Input() following: TaggedStudyGoalNode[];
  @Input() prerequisities: TaggedStudyGoalNode[];
  @Input() editing: boolean;
  @Output() goalChanged = new EventEmitter<StudyGoal>();

  treeControl = new NestedTreeControl<TaggedStudyGoalNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TaggedStudyGoalNode>();

  constructor(private serverService: ServerService, private store: Store, private dialog: MatDialog) {
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.prerequisities) {
      this.dataSource.data = this.prerequisities;
    } else {
      this.dataSource.data = this.following;
    }
  }

  hasChild(_: number, node: TaggedStudyGoalNode) {
    return !!node.children && node.children.length > 0;
  }
  
  removable(tsgn: TaggedStudyGoalNode) {
    return this.editing && this.prerequisities && !tsgn.aisRelative && this.dataSource.data.some(node => node.id === tsgn.id);
  }

  private prereqNamesArray(tsgn: TaggedStudyGoalNode, nested = false): string[] {
    if (tsgn.children.length) {
      return tsgn.children.reduce((arr, child) => [...arr, ...this.prereqNamesArray(child, true)], nested ? [tsgn.id] : []);
    } else {
      return nested ? [tsgn.id] : [];
    }
  }
 
  removeStudyGoal(tsgn: TaggedStudyGoalNode) {
    let deletingPrerequisities = tsgn.id;
    if (tsgn.children && tsgn.children.length) {
      deletingPrerequisities += " a jeho prerekvizity " + this.prereqNamesArray(tsgn).join(", ");
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: "Zmazanie obsahovej prerekvizity" , message: "Naozaj zmazať " + deletingPrerequisities + " ?"}
    });
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.store.dispatch(new RemoveStudyGoalRequirement(this.mainStudyGoal.id, tsgn.id)).subscribe(()=> {
          const studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.mainStudyGoal.id));
          this.goalChanged.emit(studyGoal);
        });
      }
    });
  }

  subjectUrl(subjectId: string) {
    return "/study-goal/" + subjectId.split('/').join('-');
  }
}
