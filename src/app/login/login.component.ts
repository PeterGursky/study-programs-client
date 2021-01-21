import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Auth } from 'src/entities/auth';
import { ServerService } from 'src/services/server.service';
import { Login } from 'src/shared/auth.actions';
import { AuthState } from 'src/shared/auth.state';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  auth: Auth = new Auth('','');
  hidePassword = true;
  
  constructor(private router: Router, private store: Store) { }

  ngOnInit(): void {
  }

  submitForm() {
    this.store.dispatch(new Login(this.auth)).subscribe(() => {
        if (this.store.selectSnapshot(AuthState.username)) {
          this.router.navigateByUrl(
            this.store.selectSnapshot(AuthState.redirectUrl));
        }
    });
  }
}
