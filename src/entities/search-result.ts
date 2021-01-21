export type SerachResultType = "STUDY_PROGRAM" | "STUDY_GOAL" | "TEACHER";

export class SearchResult {
  constructor(
    public id: string,
    public title: string,
    public type: SerachResultType,
    public refId: string,
    public description: string
  ){}

  static clone(searchResult: SearchResult) {
    return new SearchResult(searchResult.id, 
                            searchResult.title,
                            searchResult.type,
                            searchResult.refId,
                            searchResult.description);
  }

  public get typeSk() {
    switch(this.type) {
      case "STUDY_GOAL": return "Predmety a ciele";
      case "TEACHER": return "Učitelia";
      case "STUDY_PROGRAM": return "Študijné programy";
      default: return null;
    }
  }
}