import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { StudyGoal, TaggedStudyGoalNode } from 'src/entities/study-goal';
import { Select, Store } from '@ngxs/store';
import { ChangeStudyGoalUrl, GetStudyGoal, GetStudyGoalsForStudyGoal, ReloadStudyGoals, RemoveStudyGoalDescription, RemoveStudyGoalUrl, SaveStudyGoalDescription } from 'src/shared/goals.actions';
import { GoalsState } from 'src/shared/goals.state';
import { teacherRoleSK, TeacherRole } from 'src/entities/teacher'; 
import { subjectEvaluationTypeSK, subjectTextTypeSK, TaggedStudyGoal } from 'src/entities/study-goal'; 
import { AuthState } from 'src/shared/auth.state';
import { Observable } from 'rxjs';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-study-goal',
  templateUrl: './study-goal.component.html',
  styleUrls: ['./study-goal.component.css']
})
export class StudyGoalComponent implements OnInit {
  goalId: string;
  studyGoal: StudyGoal;
  studyPrograms: {};
  panelOpenState = false;
  activeTeacherRoles = [];
  subjectEvaluationTypeSK = subjectEvaluationTypeSK;
  subjectTextTypeSK = subjectTextTypeSK;
  visibleSubjectTextTypes = ['SO','VV','L','PJ','PA','PZ'];
  invisibleSubjectTextTypes = ['S','C','P','O','Z','ON','VH'];
  hasInvisibleTexts = false;
  otherStudyGoalsIds = [];
  editing = false;
  url = "";
  descriptionHTML = "";
  descriptionTXT = "";
  @Select(AuthState.username) userName$: Observable<string>;

  sgPrerequisities: TaggedStudyGoal[] = [];
  sgFollowing: TaggedStudyGoal[] = [];
  sgFieldsOfExpretise: TaggedStudyGoal[] = [];
  sgStateExams: TaggedStudyGoal[] = [];

  expandPrerequisities = false;
  expandFollowing = false;
  sgPrerequisitiesTree: TaggedStudyGoalNode[] = [];
  sgFollowingTree: TaggedStudyGoalNode[] = [];
  @ViewChild(MatAccordion) accordion: MatAccordion;
  
  constructor(private route: ActivatedRoute, private store: Store) { }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(params => console.log("povodne id predmetu: " + params.id)),
      map(params =>  this.goalId = params.id.split('-').join('/')),
      tap(id => console.log("id predmetu: " + id)),
      switchMap(id => this.store.dispatch(new GetStudyGoal(id))))
    .subscribe(() => {
      this.studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.goalId));
      this.extractFields();
      console.log("study goal received to component:", this.studyGoal);
      this.store.dispatch(new GetStudyGoalsForStudyGoal(this.otherStudyGoalsIds)).subscribe(() => {
        this.extractRelativeStudyGoals();
      })
    });
  }

  extractFields() {
    const studyProgramsInSubject = this.studyGoal.inStudyPrograms[this.studyGoal.id];
    this.studyPrograms = studyProgramsInSubject ? studyProgramsInSubject.reduce(
      (acc,prog) => ({...acc, [prog.blockType] : [...(acc[prog.blockType] || [] ), prog]}),
      {}) : {};
    this.activeTeacherRoles=[];
    this.url = this.studyGoal.url || "";
    this.descriptionHTML = this.studyGoal.description ? this.studyGoal.description.split('\n').join('<br>'): "";
    this.descriptionTXT = this.studyGoal.description || "";
    this.hasInvisibleTexts = false;
    if (this.studyGoal.ais) {
      for (let role of Object.keys(teacherRoleSK)) {
        const teachers = [];
        for (let teacher of this.studyGoal.ais.teachers) {
          if (teacher.roles.includes(role as TeacherRole)) {
            teachers.push(teacher);
          }
        }
        if (teachers.length > 0) {
          this.activeTeacherRoles.push({role: teacherRoleSK[role], teachers});
        }
      }
      for (let textId of this.invisibleSubjectTextTypes) {
        if (this.studyGoal.ais.texts[textId]) {
          this.hasInvisibleTexts = true;
          break;
        }
      }
    }
    this.otherStudyGoalsIds = [...this.studyGoal.following, ...this.studyGoal.prerequisities].map(subj => subj.id);
  }  
  
  private isAisPrerequisity(main: StudyGoal, prereq: StudyGoal): boolean {
    if (!main || !main.ais || !prereq || !prereq.ais) 
      return false;
    for (let subj of main.ais.prerequisites) {
      if (subj.id === prereq.id)
        return true;
    }
    for (let subj of main.ais.prerequisites) {
      const goal = this.store.selectSnapshot(GoalsState.goalById(subj.id));
      if (this.isAisPrerequisity(goal, prereq))
        return true;
    }
    return false;
  }

  /* returns  */
  private moveAisIrelevantRelatives(aisRelatives: TaggedStudyGoalNode[], otherRoots: TaggedStudyGoalNode[], prereq: boolean): TaggedStudyGoalNode[] {
    let restOtherRoots: TaggedStudyGoalNode[] = null;
    for (let aisR of aisRelatives) {
      if (aisR.children && aisR.children.length) {
        if (restOtherRoots) {
          restOtherRoots = this.moveAisIrelevantRelatives(aisR.children, otherRoots, prereq).filter(node => restOtherRoots.some(restNode => restNode.id === node.id)); 
          //prienik - tu a vyššie skúšam prideľovať iba také, ktoré neboli pridelené žiadnemu dieťaťu
        } else {
          restOtherRoots = this.moveAisIrelevantRelatives(aisR.children, otherRoots, prereq)
        }
      }
    }
    if (!restOtherRoots) // ak ani jeden z aisRelatives nemá deti
      restOtherRoots = otherRoots;
    let assignedRoots: TaggedStudyGoalNode[] = [];
    for (let node of restOtherRoots) {
      let assigned = false;
      for (let aisR of aisRelatives) {
        if ((prereq && aisR.goal && aisR.goal.prerequisities.some(prer => prer.id === node.id)) || 
            (!prereq && aisR.goal && aisR.goal.following.some(prer => prer.id === node.id))) {
              aisR.children = [...aisR.children, node];
              assigned = true;
        }
      }
      if (assigned) 
        assignedRoots.push(node);
    }
    return restOtherRoots.filter(node => ! assignedRoots.includes(node));
  }

  private fillTrees(studyGoal: StudyGoal, prereq: boolean, node?: TaggedStudyGoalNode) : TaggedStudyGoalNode[] {
    if (!studyGoal) return;
    const taggedStudyGoals = prereq ? this.sgPrerequisities : this.sgFollowing;
    const filterFn = (tsg: TaggedStudyGoal) => prereq
                        ? studyGoal.ais.prerequisites.some(aisP => aisP.id === tsg.id)
                        :tsg.goal.ais.prerequisites.some(aisP => aisP.id === studyGoal.id);

    let children = studyGoal.ais ? taggedStudyGoals.filter(filterFn).map(taggedGoal => ({...taggedGoal, children: null})) : [];
    if (node) {
      children.forEach(child => this.fillTrees(child.goal, prereq, child));
      node.children = children;
    } else {
      if (prereq) {
        const otherRelatives = this.sgPrerequisities.filter(tsg => !tsg.aisRelative);
        let otherRoots = otherRelatives.filter(tsg => ! otherRelatives.some(other => other.goal.prerequisities.some(prer => prer.id === tsg.id)));
        let otherRootNodes = otherRoots.map(taggedGoal => ({...taggedGoal, children: null}));
        children.forEach(child => this.fillTrees(child.goal, prereq, child));
        otherRootNodes.forEach(child => this.fillTrees(child.goal, prereq, child));
        let restOtherRootNodes = this.moveAisIrelevantRelatives(children, otherRootNodes, prereq);
        this.sgPrerequisitiesTree = [...children, ...restOtherRootNodes];
      } else {
        const otherRelatives = this.sgFollowing.filter(tsg => !tsg.aisRelative);
        let otherRoots = otherRelatives.filter(tsg => ! otherRelatives.some(other => other.goal.following.some(prer => prer.id === tsg.id)));
        let otherRootNodes = otherRoots.map(taggedGoal => ({...taggedGoal, children: null}));
        children.forEach(child => this.fillTrees(child.goal, prereq, child));
        otherRootNodes.forEach(child => this.fillTrees(child.goal, prereq, child));
        let restOtherRootNodes = this.moveAisIrelevantRelatives(children, otherRootNodes, prereq);
        this.sgFollowingTree = [...children, ...restOtherRootNodes];
      }
    }
  }

  extractRelativeStudyGoals(){
    this.sgPrerequisities = [];
    this.sgFollowing = [];
    this.sgFieldsOfExpretise = [];
    this.sgStateExams = [];
    for (let goalId of this.otherStudyGoalsIds) {
      const goal = this.store.selectSnapshot(GoalsState.goalById(goalId));
      if (goal) {
        if (goal.ais) {
          if (goal.ais.type === 'B') {  //bezny predmet
            if (this.studyGoal.prerequisities.some(sgn => sgn.id === goal.id)) {
              this.sgPrerequisities.push({goal, id: goalId, name: goal.name, aisRelative: this.isAisPrerequisity(this.studyGoal, goal)});
            } else {
              this.sgFollowing.push({goal, id: goalId, name: goal.name, aisRelative: this.isAisPrerequisity(goal, this.studyGoal)});
            }
          } else {
            this.sgStateExams.push({goal, id: goalId, name: goal.name, aisRelative: true});
          }
        } else {
          this.sgFieldsOfExpretise.push({goal, id: goalId, name: goal.name, aisRelative: false });
        }
      } else {
        this.sgPrerequisities.push({goal: null, id: goalId, name: this.studyGoal.prerequisities.find(sgn => sgn.id === goalId).name, aisRelative: true });
      }
    }
    this.sgPrerequisitiesTree = [];
    this.sgFollowingTree = [];
    this.fillTrees(this.studyGoal, true);
    this.fillTrees(this.studyGoal, false);
    console.log("prereqTree", this.sgPrerequisitiesTree);
    console.log("follTree", this.sgFollowingTree);
  }

  subjectUrl(subjectId: string) {
    return "/study-goal/" + subjectId.split('/').join('-');
  }

  textTitle(textId: string): string {
    return subjectTextTypeSK[textId];
  }

  sendUrl() {
    this.store.dispatch(new ChangeStudyGoalUrl(this.goalId,this.url)).subscribe(() => {
      this.studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.goalId));
      this.url = this.studyGoal.url;
    });
  }

  deleteUrl() {
    this.store.dispatch(new RemoveStudyGoalUrl(this.goalId)).subscribe(() => {
      this.studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.goalId));
      this.url = this.studyGoal.url;
    });
  }

  saveDescription() {
    this.store.dispatch(new SaveStudyGoalDescription(this.goalId,this.descriptionTXT)).subscribe(() => {
      this.studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.goalId));
      this.descriptionHTML = this.studyGoal.description ? this.studyGoal.description.split('\n').join('<br>'): "";
      this.descriptionTXT = this.studyGoal.description || "";
    });
  }

  deleteDescription() {
    this.store.dispatch(new RemoveStudyGoalDescription(this.goalId)).subscribe(() => {
      this.studyGoal = this.store.selectSnapshot(GoalsState.goalById(this.goalId));
      this.descriptionHTML = this.studyGoal.description ? this.studyGoal.description.split('\n').join('<br>'): "";
      this.descriptionTXT = this.studyGoal.description || "";
    });
  }

  changeRequirements(goal: StudyGoal) {
    this.otherStudyGoalsIds = [];
    [...this.studyGoal.following, ...this.studyGoal.prerequisities, ...goal.following, ...goal.prerequisities].forEach(subj => {
        if (!this.otherStudyGoalsIds.includes(subj.id)) 
          this.otherStudyGoalsIds.push(subj.id)
    });

    this.studyGoal = goal;
    this.store.dispatch(new ReloadStudyGoals(this.otherStudyGoalsIds)).subscribe(() => {
      this.otherStudyGoalsIds = [...this.studyGoal.following, ...this.studyGoal.prerequisities].map(subj => subj.id);
      this.extractRelativeStudyGoals();
    });
  }
}
