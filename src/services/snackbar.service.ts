import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  errorMessage(message: string) {
    this.snackBar.open(message, "CHYBA", { duration: 5000, panelClass:'redSnackBar' });
  }

  successMessage(message: string) {
    this.snackBar.open(message , "ÚSPECH", { duration: 5000, panelClass:'greenSnackBar' });
  }
}
