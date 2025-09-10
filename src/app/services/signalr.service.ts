import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';

export interface ChatMessage {
  id: string;
  roomMemberId: string;
  message: string;
  senderName: string;
  lastActionDate: Date;
  timestamp: Date;
  chatRoomId: string;
  isCurrentUser: boolean;
}

export interface TypingIndicator {
  roomId: string;
  userName: string;
  isTyping: boolean;
}

export interface UserPresence {
  roomId: string;
  userName: string;
  action: 'joined' | 'left';
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private readonly baseUrl = environment.hubUrl || 'https://localhost:7003';
  
  // Observables for real-time events
  private messageReceived = new Subject<ChatMessage>();
  private typingIndicator = new Subject<TypingIndicator>();
  private userPresence = new Subject<UserPresence>();
  private connectionStatus = new BehaviorSubject<boolean>(false);

  // Public observables
  public messageReceived$ = this.messageReceived.asObservable();
  public typingIndicator$ = this.typingIndicator.asObservable();
  public userPresence$ = this.userPresence.asObservable();
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor(private authService: AuthService) {}

  public async startConnection(): Promise<void> {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR connection started');
      this.connectionStatus.next(true);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStatus.next(false);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
      this.connectionStatus.next(false);
      console.log('SignalR connection stopped');
    }
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Handle incoming messages
    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      console.log("message received:", message);
      
      this.messageReceived.next(message);
    });

    // Handle typing indicators
    this.hubConnection.on('SendTypingIndicator', (indicator: TypingIndicator) => {
      this.typingIndicator.next(indicator);
    });

    // Handle user presence
    this.hubConnection.on('UserJoined', (presence: UserPresence) => {
      this.userPresence.next({ ...presence, action: 'joined' });
    });

    this.hubConnection.on('UserLeft', (presence: UserPresence) => {
      this.userPresence.next({ ...presence, action: 'left' });
    });

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionStatus.next(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionStatus.next(true);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.connectionStatus.next(false);
    });
  }

  // Client-to-server methods
  public async sendMessage(roomMemberId: string, message: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === 'Connected') {
      try {
        await this.hubConnection.invoke('SendMessage', roomMemberId, message);
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection not established');
    }
  }

  public async sendTypingIndicator(roomId: string, isTyping: boolean): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === 'Connected') {
      try {
        await this.hubConnection.invoke('SendTypingIndicator', roomId, this.authService.getCurrentUser().userName, isTyping);
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }
  }

  public async joinRoom(roomId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === 'Connected') {
      try {
        await this.hubConnection.invoke('JoinRoom', roomId);
        console.log(`Joined room: ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection not established');
    }
  }

  public async leaveRoom(roomId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === 'Connected') {
      try {
        await this.hubConnection.invoke('LeaveRoom', roomId);
        console.log(`Left room: ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }
}

