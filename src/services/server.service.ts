import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, map, mapTo, tap } from 'rxjs/operators';
import { Auth } from 'src/entities/auth';
import { SearchResult, SerachResultType as SearchResultType } from 'src/entities/search-result';
import { StudyGoal, StudyGoalRequirement } from 'src/entities/study-goal';
import { StudyProgram } from 'src/entities/study-program';
import { Teacher } from 'src/entities/teacher';
import { environment } from 'src/environments/environment';
import { SnackbarService } from './snackbar.service';

export interface HttpOptionsType {
  headers?: { [header: string]: string };
  params?: HttpParams;
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private serverUrl = environment.production ? "http://predmety.uinf.sk/api/" : "http://localhost:8080/api/";

  constructor(private http: HttpClient, 
              private snackbarService: SnackbarService,
              ){}


  httpOptions(auth: Auth): HttpOptionsType {
    return auth 
          ? { headers: { 
              'Authorization': 
                  "Basic " + btoa(auth.name + ":"+ auth.password) 
              } 
            } 
          : null;
  }

  checkCredentials(httpOptions: HttpOptionsType, login: boolean): Observable<boolean> {
    return this.http.get(this.serverUrl+ "login", httpOptions).pipe(
      mapTo(true),
      catchError(error => this.processHttpError(error, login).pipe(
        defaultIfEmpty(false)
      ))
    ); 
  }

  search(filter: string, type?: SearchResultType, httpOptions?:HttpOptionsType ):Observable<SearchResult[]> {
    let options = { ...(httpOptions || {}), params: new HttpParams() };
    options.params = options.params.set('q', filter);  
    if (type) {
      options.params = options.params.set('type', type);
    }
    return this.http.get<SearchResult[]>(this.serverUrl+"search", options).pipe(
      map( results => results.map(oneRes => SearchResult.clone(oneRes))),
      catchError(error => this.processHttpError(error))
    );  
  }

  getStudyPrograms():Observable<StudyProgram[]> {
    return this.http.get<StudyProgram[]>(this.serverUrl+ "study-program/").pipe(
      catchError(error => this.processHttpError(error))
    );
  }

  getStudyProgramById(id: string):Observable<StudyProgram> {
    return this.http.get<StudyProgram>(this.serverUrl+ "study-program/" + id).pipe(
      catchError(error => this.processHttpError(error))
    );
  }

  addFieldOfExpertiseToProgram(httpOptions: HttpOptionsType, programId: string, expertiseName: string): Observable<StudyProgram> {
    return this.http.post<StudyProgram>(this.serverUrl+ "study-program/" + programId + "/field-of-expertise", expertiseName, httpOptions).pipe(
      catchError(error => this.processHttpError(error))
    ); 
  }

  removeFieldOfExpertiseInProgram(httpOptions: HttpOptionsType, programId: string, foeId: string): Observable<StudyProgram> {
    return this.http.delete<StudyProgram>(this.serverUrl+ "study-program/" + programId + "/field-of-expertise/" + foeId, httpOptions).pipe(
      catchError(error => this.processHttpError(error))
    ); 
  }
  
  getStudyGoalById(id: string):Observable<StudyGoal> {
    return this.http.get<StudyGoal>(this.serverUrl+ "study-goal/" + id).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return of(null);
        }
        return this.processHttpError(error);
      })
    );
  }

  saveStudyGoalUrl(httpOptions: HttpOptionsType, goalId:string, url: string): Observable<StudyGoal> {
    return this.http.post<StudyGoal>(this.serverUrl + "study-goal/" + goalId + "/url", url, httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("URL predmetu uložená")),
      catchError(error => this.processHttpError(error))
    )
  }

  removeStudyGoalUrl(httpOptions: HttpOptionsType, goalId:string): Observable<StudyGoal> {
    return this.http.delete<StudyGoal>(this.serverUrl + "study-goal/" + goalId + "/url", httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("URL predmetu odstránená")),
      catchError(error => this.processHttpError(error))
    )
  }
  
  saveStudyGoalDescription(httpOptions: HttpOptionsType, goalId:string, description: string): Observable<StudyGoal> {
    return this.http.post<StudyGoal>(this.serverUrl + "study-goal/" + goalId + "/description", description, httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("Popis predmetu uložený")),
      catchError(error => this.processHttpError(error))
    )
  }

  removeStudyGoalDescription(httpOptions: HttpOptionsType, goalId:string): Observable<StudyGoal> {
    return this.http.delete<StudyGoal>(this.serverUrl + "study-goal/" + goalId + "/description", httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("Popis predmetu odstránený")),
      catchError(error => this.processHttpError(error))
    )
  }

  saveStudyGoalRequirement(httpOptions: HttpOptionsType, goalId:string, req: StudyGoalRequirement): Observable<StudyGoal> {
    return this.http.post<StudyGoal>(this.serverUrl + "study-goal/" + goalId + "/requirement", req, httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("Text požiadavky uložený")),
      catchError(error => this.processHttpError(error))
    )
  }

  removeStudyGoalRequirement(httpOptions: HttpOptionsType, goalId:string, reqId: string): Observable<StudyGoal> {
    return this.http.delete<StudyGoal>(this.serverUrl + "study-goal/" + goalId + "/requirement/" + reqId, httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("Obsahová prerekvizita odstránená")),
      catchError(error => this.processHttpError(error))
    )
  }

  getTeacherById(id: string):Observable<Teacher> {
    return this.http.get<Teacher>(this.serverUrl+ "teacher/" + id).pipe(
      catchError(error => this.processHttpError(error))
    );
  }

  saveTeacherUrl(httpOptions: HttpOptionsType, teacherId:number, url: string): Observable<Teacher> {
    return this.http.post<Teacher>(this.serverUrl + "teacher/" + teacherId + "/url", url, httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("URL učiteľa uložená")),
      catchError(error => this.processHttpError(error))
    )
  }

  removeTeacherUrl(httpOptions: HttpOptionsType, teacherId:number): Observable<Teacher> {
    return this.http.delete<Teacher>(this.serverUrl + "teacher/" + teacherId + "/url", httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("URL učiteľa odstránená")),
      catchError(error => this.processHttpError(error))
    )
  }

  saveTeacherResearch(httpOptions: HttpOptionsType, teacherId:number, research: string): Observable<Teacher> {
    return this.http.post<Teacher>(this.serverUrl + "teacher/" + teacherId + "/research", research, httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("Vedecké zameranie učiteľa uložené")),
      catchError(error => this.processHttpError(error))
    )
  }

  removeTeacherResearch(httpOptions: HttpOptionsType, teacherId:number): Observable<Teacher> {
    return this.http.delete<Teacher>(this.serverUrl + "teacher/" + teacherId + "/research", httpOptions).pipe(
      tap(_goal => this.snackbarService.successMessage("Vedecké zameranie učiteľa odstránené")),
      catchError(error => this.processHttpError(error))
    )
  }

  private processHttpError(error, login? :boolean) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        this.snackbarService.errorMessage("Server je nedostupný");
        return EMPTY;
      }
      if (error.status === 401) {
          this.snackbarService.errorMessage(login ? "Zlý login alebo heslo" : "Boli ste odhlásený/á");
          return EMPTY;
      } 
      if (error.status >= 400 && error.status < 500) {
          this.snackbarService.errorMessage("Chyba: " + error.error);
          return EMPTY;
      }
    }
    this.snackbarService.errorMessage("Chyba: " + JSON.stringify(error));
    return EMPTY;
  }
}
