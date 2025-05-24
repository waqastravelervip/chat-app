import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    return this.http.post(this.apiUrl, body, { headers });
  }
} 