import { Component, OnInit } from '@angular/core';
import { StudyProgram } from 'src/entities/study-program';
import { ServerService } from 'src/services/server.service';

@Component({
  selector: 'app-study-programs',
  templateUrl: './study-programs.component.html',
  styleUrls: ['./study-programs.component.css']
})
export class StudyProgramsComponent implements OnInit {

  programs: StudyProgram[];
  programLevels: StudyProgram[][] = [[],[],[],[]];
  levelNames =[
    "Bakalárske študijné programy", 
    "Magisterské študijné programy", 
    "Doktorandské študijné programy", 
    "Ostatné študijné programy"
  ];
  constructor(private serverService: ServerService) { }

  ngOnInit(): void {
    this.serverService.getStudyPrograms().subscribe(p => {
      this.programs = p;
      this.extractLevels();
      console.log('Programy: ',this.programLevels);
    });
  }

  extractLevels() {
    this.programs.forEach(program => {
      switch (program.plan.level) {
        case "I.": this.programLevels[0].push(program);
          break;
        case "II.": this.programLevels[1].push(program);
          break;
        case "III.": this.programLevels[2].push(program);
          break;
        default: this.programLevels[3].push(program);
          break;
      }
    });
    this.programLevels.forEach(level => level.sort((a,b) => {
      const aJedno = a.plan.name.includes('Jednoodbor');
      const bJedno = b.plan.name.includes('Jednoodbor');
      if (aJedno && !bJedno) return -1;
      if (!aJedno && bJedno) return 1;
      if (a.plan.code < b.plan.code) return -1;
      if (a.plan.code > b.plan.code) return 1;
      return 0;
    }));
  }
}
