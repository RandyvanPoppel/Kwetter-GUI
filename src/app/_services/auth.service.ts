import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentTokenSubject: BehaviorSubject<string>;
  public currentToken: Observable<string>;

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('Token')));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get getCurrentTokenValue(): string {
    return this.currentTokenSubject.value;
  }

  login(username: string, password: string) {

    let myHeaders = new HttpHeaders();
    myHeaders = myHeaders.append('Content-Type', 'application/json');
    myHeaders = myHeaders.append('Authorization', 'Basic ' + btoa(username + ':' + password));

    return this.http.post<any>('http://localhost:8080/Kwetter-1.0/rest/auth/login', null, {headers: myHeaders, observe: 'response'})
      .pipe(map(result => {
        console.log(result.headers.get('Authorization'));
        // login successful if there's a jwt token in the response
        if (result) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          const token = result.headers.get('Authorization');
          localStorage.setItem('Token', JSON.stringify(token));
          this.currentTokenSubject.next(token);
        }

        return result;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('Token');
    this.currentTokenSubject.next(null);
  }
}
