import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { SearchResult } from 'src/entities/search-result';
import { ServerService } from 'src/services/server.service';
import { Logout, UrlAfterLogin } from 'src/shared/auth.actions';
import { AuthState } from 'src/shared/auth.state';

// export interface StateGroup {
//   letter: string;
//   names: string[];
// }

interface ResultGroup {
  type: string;
  results: SearchResult[];
}

// export const _filter = (opt: string[], value: string): string[] => {
//   const filterValue = value.toLowerCase();

//   return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
// };

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  @Select(AuthState.username) username$: Observable<string>; 
  username: string;

  queryForm = new FormGroup({
    queryField: new FormControl('')
  }); 

  // stateGroups: StateGroup[] = [{
  //   letter: 'A',
  //   names: ['Alabama', 'Alaska', 'Arizona', 'Arkansas']
  // }, {
  //   letter: 'C',
  //   names: ['California', 'Colorado', 'Connecticut']
  // }, {
  //   letter: 'D',
  //   names: ['Delaware']
  // }, {
  //   letter: 'F',
  //   names: ['Florida']
  // }, {
  //   letter: 'G',
  //   names: ['Georgia']
  // }, {
  //   letter: 'H',
  //   names: ['Hawaii']
  // }, {
  //   letter: 'I',
  //   names: ['Idaho', 'Illinois', 'Indiana', 'Iowa']
  // }, {
  //   letter: 'K',
  //   names: ['Kansas', 'Kentucky']
  // }, {
  //   letter: 'L',
  //   names: ['Louisiana']
  // }, {
  //   letter: 'M',
  //   names: ['Maine', 'Maryland', 'Massachusetts', 'Michigan',
  //     'Minnesota', 'Mississippi', 'Missouri', 'Montana']
  // }, {
  //   letter: 'N',
  //   names: ['Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  //     'New Mexico', 'New York', 'North Carolina', 'North Dakota']
  // }, {
  //   letter: 'O',
  //   names: ['Ohio', 'Oklahoma', 'Oregon']
  // }, {
  //   letter: 'P',
  //   names: ['Pennsylvania']
  // }, {
  //   letter: 'R',
  //   names: ['Rhode Island']
  // }, {
  //   letter: 'S',
  //   names: ['South Carolina', 'South Dakota']
  // }, {
  //   letter: 'T',
  //   names: ['Tennessee', 'Texas']
  // }, {
  //   letter: 'U',
  //   names: ['Utah']
  // }, {
  //   letter: 'V',
  //   names: ['Vermont', 'Virginia']
  // }, {
  //   letter: 'W',
  //   names: ['Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
  // }];

  searchOptions: Observable<ResultGroup[]>;

  constructor(private router: Router, 
              private store: Store, 
              private serverService: ServerService) { } 

  ngOnInit(): void {
    this.username$.subscribe(u => this.username = u); 
    this.searchOptions = this.queryField!.valueChanges
      .pipe(
        startWith(''),
        switchMap(value => this.getResultGroups(value))
      );
  }

  get queryField(): FormControl {
   return this.queryForm.get('queryField') as FormControl;
  }
  private getResultGroups(filter: string): Observable<ResultGroup[]> {
    if (filter) {
      return this.serverService.search(filter).pipe(
        tap(data => console.log('before group results', data)),
        map(results => this.groupResults(results)),
        tap(data => console.log('after group results', data))
      );
    }
    return of([]);
  }

  groupResults(results: SearchResult[]): ResultGroup[] {
    return results.reduce((acc, entry) => acc.some(obj => obj.type===entry.type)
                                          ? acc.map(obj => obj.type===entry.type 
                                                           ? {...obj, results: [...obj.results, entry]}
                                                           : obj)
                                          : [...acc, {type: entry.type, results: [entry]}], []);
  }

  displayResult(result: SearchResult) {
    return result && result.description ? result.description : "";
  }
  logout() {
    this.store.dispatch(new Logout());
  }

  selected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value as SearchResult;
    switch (value.type) {
      case "STUDY_PROGRAM":
        this.router.navigateByUrl("/study-program/" + value.refId);
        break;
      case "STUDY_GOAL":
        this.router.navigateByUrl("/study-goal/" + encodeURIComponent(value.refId));
        break;
      case "TEACHER":
        this.router.navigateByUrl("/teacher/" + value.refId);
        break;
    }
    this.queryField.setValue('');
  }

  setUrlAfterLogin() {
    console.log('login page from ',this.router.url);
    this.store.dispatch(new UrlAfterLogin(this.router.url));
  }
}
