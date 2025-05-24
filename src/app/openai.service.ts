import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${environment.openaiApiKey}`);

    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7
    };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      tap(response => {
        console.log('API Response:', response);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    if (error.status === 401) {
      console.error('Authentication failed. Please check your API key.');
      console.log('API Key used:', environment.openaiApiKey);
    }
    return throwError(() => error);
  }
} 