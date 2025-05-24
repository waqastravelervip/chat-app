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

  constructor(private http: HttpClient) {
    // Log the API key length on service initialization (for debugging)
    console.log('API Key length:', environment.openaiApiKey?.length || 0);
  }

  search(query: string): Observable<any> {
    // Ensure the API key exists and is properly formatted
    if (!environment.openaiApiKey) {
      console.error('OpenAI API key is missing');
      return throwError(() => new Error('OpenAI API key is missing'));
    }

    const apiKey = environment.openaiApiKey.trim();
    if (!apiKey.startsWith('sk-')) {
      console.error('Invalid API key format. Key should start with "sk-"');
      return throwError(() => new Error('Invalid API key format'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    });

    // Log the headers for debugging (excluding the full API key)
    console.log('Request headers:', {
      'Content-Type': headers.get('Content-Type'),
      'Authorization': 'Bearer ' + apiKey.substring(0, 7) + '...'
    });

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
      // Log the first few characters of the API key for debugging
      const apiKey = environment.openaiApiKey || '';
      console.log('API Key prefix:', apiKey.substring(0, 7) + '...');
      console.log('API Key length:', apiKey.length);
    }
    return throwError(() => error);
  }
} 