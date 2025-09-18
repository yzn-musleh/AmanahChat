import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ChatItem } from '../chat-list.component/chat-list.component';

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  isFromCurrentUser: boolean;
  isFromDriver?: boolean;
  senderName?: string;
  senderAvatar?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ConversationUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  role?: 'driver' | 'customer' | 'support';
}

export interface SendMessageRequest {
  roomMemberId: string;
  message: string;
  chatRoomId: string;
  filePath?: string;
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements AfterViewChecked {

  @Input() config: any

  @Input() messages: any[] | null = [];
  
  @Input() placeholder: string = 'Type a message...';
  @Input() showOnlineStatus: boolean = true;
  @Input() allowFileUpload: boolean = true;
  @Input() maxHeight: string = '600px';
  @Input() isTyping: boolean = false;
  @Input() selectedChat!: ChatItem ;

  @Output() onSendMessage = new EventEmitter<string>();
  @Output() onFileUpload = new EventEmitter<File>();
  @Output() backToList = new EventEmitter<void>();

  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  private shouldScrollToBottom = false;

  messageForm: FormGroup;

  private destroy$ = new Subject<void>();

  // Real-time features
  typingUsers: string[] = [];
  isLoading = false;
  isSending = false;

  constructor(private apiService: ApiService,
    private fb: FormBuilder){
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    console.log("messsages from conversation", this.messages);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }

  }

  sendMessage(): void {
    const messageText = this.messageForm.get('message')?.value?.trim();
  console.log("message text: ", messageText);

  console.log("message form: ", this.messageForm);
  console.log("selectedChat: ", this.selectedChat)
  
  
  

    if (this.messageForm.invalid || !this.selectedChat ) return;

    this.isSending = true;
    const request: SendMessageRequest = {
      roomMemberId: this.selectedChat.roomMemberId,
      chatRoomId: this.selectedChat?.chatRoomId,
      message: messageText
    };
    this.apiService.sendMessage(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messageId) => {
          this.messages?.push({
            id: messageId,
            message: messageText,
            senderName: 'You',
            timestamp: new Date(),
            roomMemberId: this.selectedChat?.roomMemberId,
            isFromCurrentUser: true,
            status: 'sent'
          });
          this.messageForm.reset();
          this.shouldScrollToBottom = true;
          this.isSending = false;
          setTimeout(() => this.messageInput?.nativeElement?.focus(), 100);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isSending = false;
        }
      });
  }

  onKeyPress(event: KeyboardEvent) {    
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.onFileUpload.emit(file);
    }
  }

  closeConversation() {
    this.backToList.emit();
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    return timestamp.toLocaleDateString();
  }

  getAvatarText(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  
}

