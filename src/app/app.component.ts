import { Component, ViewChild, ElementRef } from '@angular/core';
import { OpenAIService } from './openai.service';
import { AuthService } from './auth.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  title = 'Google Search with OpenAI';
  searchQuery = '';
  searchResult: string = '';
  isLoading = false;
  hasResults = false;
  chatSessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  isSidebarOpen = false;
  currentYear = new Date().getFullYear();

  // Email signup related properties
  emailInput = '';
  showEmailError = false;
  isValidEmail = false;

  constructor(
    private openAIService: OpenAIService,
    public authService: AuthService
  ) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResult = '';
    this.hasResults = false;
    this.searchInput.nativeElement.focus();
  }

  createNewSession() {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: this.searchQuery,
      messages: [],
      timestamp: new Date()
    };
    this.chatSessions.unshift(session);
    this.currentSession = session;
    return session;
  }

  async performSearch() {
    if (!this.searchQuery.trim()) return;
    
    this.isLoading = true;
    this.hasResults = true;

    // Create new session if no current session exists
    if (!this.currentSession) {
      this.currentSession = this.createNewSession();
    }

    // Add user message
    if (this.currentSession) {
      this.currentSession.messages.push({
        role: 'user',
        content: this.searchQuery,
        timestamp: new Date()
      });

      this.openAIService.search(this.searchQuery).subscribe({
        next: (response) => {
          const assistantMessage = response.choices[0].message.content;
          this.searchResult = assistantMessage;
          this.isLoading = false;

          // Add assistant message
          if (this.currentSession) {
            this.currentSession.messages.push({
              role: 'assistant',
              content: assistantMessage,
              timestamp: new Date()
            });
          }
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResult = 'Sorry, there was an error processing your request. Please try again.';
          this.isLoading = false;

          // Add error message
          if (this.currentSession) {
            this.currentSession.messages.push({
              role: 'assistant',
              content: this.searchResult,
              timestamp: new Date()
            });
          }
        }
      });
    }
  }

  formatResponse(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  loadSession(session: ChatSession) {
    this.currentSession = session;
    if (session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      this.searchResult = lastMessage.content;
      this.hasResults = true;
    }
  }

  startNewSession() {
    this.currentSession = null;
    this.clearSearch();
  }

  clearHistory() {
    this.chatSessions = [];
    this.currentSession = null;
    this.clearSearch();
  }

  // Email signup related methods
  onEmailInput() {
    this.isValidEmail = this.authService.isValidEmail(this.emailInput);
    this.showEmailError = !this.isValidEmail && this.emailInput.length > 0;
  }

  async signUp() {
    if (!this.isValidEmail) {
      this.showEmailError = true;
      return;
    }

    try {
      await this.authService.signUpWithEmail(this.emailInput);
      this.emailInput = '';
      this.showEmailError = false;
    } catch (error) {
      console.error('Signup error:', error);
      // Handle signup error (you might want to show an error message to the user)
    }
  }
}
