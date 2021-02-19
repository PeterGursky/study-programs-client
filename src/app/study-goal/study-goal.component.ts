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

  /** returns descendants of given study goal */
  private getDescentants(studyGoal: StudyGoal, prereq: boolean): TaggedStudyGoal[] {
    if (!studyGoal) return [];
    const allGoals = prereq ? this.sgPrerequisities : this.sgFollowing;
    const filterFn = (tsg: TaggedStudyGoal) => prereq
                            ? studyGoal.prerequisities.some(prereq => prereq.id === tsg.id)
                            :tsg.goal.prerequisities.some(prereq => prereq.id === studyGoal.id);
    const filterFnAis = (tsg: TaggedStudyGoal) => prereq
                            ? studyGoal.ais.prerequisites.some(aisP => aisP.id === tsg.id)
                            :tsg.goal.ais.prerequisites.some(aisP => aisP.id === studyGoal.id);
    const aisDescs = studyGoal.ais ? allGoals.filter(filterFnAis).map(desc => ({...desc, aisRelative: true})) : [];
    return [...aisDescs,...allGoals.filter(filterFn).filter(desc => !aisDescs.some(tsg => tsg.id === desc.id))]; //vrátim najprv ais potomkov a potom zvyšných
  }


  /** returns all distinct descendants of given tagged study goals */
  private getAllDescentants(studyGoals: TaggedStudyGoal[], prereq: boolean): TaggedStudyGoal[] {
    let result = [];
    for(let parent of studyGoals) {
      const descs = this.getDescentants(parent.goal, prereq)
                        .filter(desc => !result.some(tsg => tsg.id === desc.id)); //pridáme také deti, ktoré ešte nie sú v resulte
      result = [...result, ...descs];
    }
    return result;
  }

  private getChildren(studyGoal:StudyGoal, prereq:boolean): TaggedStudyGoal[] {
    const myDescs = this.getDescentants(studyGoal,prereq);
    const grandDescs = this.getAllDescentants(myDescs,prereq);
    return myDescs.filter(myDesc => !grandDescs.some(gd => gd.id === myDesc.id)); // nechám takých potomkov, ktorí nie sú potomkami mojich detí
  }

  private fillTrees(studyGoal: StudyGoal, prereq: boolean, node?: TaggedStudyGoalNode) {
    if (!studyGoal) return;
//    debugger;
    const childrenNodes = this.getChildren(studyGoal, prereq).map(taggedGoal => ({...taggedGoal, children: null}));
    childrenNodes.forEach(child => this.fillTrees(child.goal, prereq, child));
    if (node) {
      node.children = childrenNodes;
    } else {
      if (prereq) {
        this.sgPrerequisitiesTree = childrenNodes;
      } else { 
        this.sgFollowingTree = childrenNodes;
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
