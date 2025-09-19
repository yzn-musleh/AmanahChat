import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavigationService, ViewType, WidgetState } from '../../services/navigation.service';
import { CommonModule } from '@angular/common';
import { ChatItem, ChatListComponent } from "../screens/chat-list.component/chat-list.component";
import { ChatMessage, ConversationComponent } from "../screens/conversation.component/conversation.component";
import { ManageGroup } from "../screens/manage-group/manage-group";
import { ApiService } from '../../services/api.service';
import { BehaviorSubject } from 'rxjs';
import { RoomService } from '../../services/room.service';
import { SignalRService } from '../../services/signalr.service';
import { CommunicationComponent } from '../screens/communication-component/communication-component';
import { AuthService } from '../../services/auth.service';

// Widget configuration interface
export interface ChatWidgetConfig {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enableGuestUsers?: boolean;
  // ... other config options
}

export interface WorkspaceUser {
  id: string;
  firstName: string;  
  lastName: string;
  username: string;
  isAdmin: boolean;
}

@Component({
  selector: 'chat-widget',
  imports: [CommonModule, ChatListComponent, ConversationComponent, ManageGroup, CommunicationComponent],
  templateUrl: 'widget-container.component.html',
  styleUrls: ['./widget-container.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {

  @Input() config?: ChatWidgetConfig;

  ViewType = ViewType;
  widgetState: WidgetState;

  private destroy$ = new Subject<void>();

  selectedChat!: ChatItem

  chats: ChatItem[] = []
  private messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private workspaceUsersSubject = new BehaviorSubject<WorkspaceUser[]>([]);
  workspaceUsers$ = this.workspaceUsersSubject.asObservable();

  constructor(private navigationService: NavigationService, private authService: AuthService, private roomService: RoomService, private apiService: ApiService, private signalRService: SignalRService) {
    // Initialize with current state
    this.widgetState = this.navigationService.currentState;
  }

  ngOnInit(): void {
    this.navigationService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.widgetState = state;
      });

      this.loadChatRooms()

      // Start SignalR connection and subscribe to incoming messages
      this.signalRService.startConnection().then(() => {
        // Connected - join all chat rooms for real-time updates
        this.chats.forEach(room => {
          this.signalRService.joinRoom(room.chatRoomId).catch(err => 
            console.error(`Failed to join room ${room.chatRoomId}:`, err)
          );
        });
      }).catch(err => console.error('SignalR start error:', err));

      this.signalRService.messageReceived$
        .pipe(takeUntil(this.destroy$))
        .subscribe((msg: any) => {
          // Move the chat that received the message to the top
          this.moveChatToTop(msg.chatRoomId, msg.lastActionDate);

          // Only add message to current conversation if it's the selected chat
          if (!this.selectedChat) return;
          if (msg.chatRoomId === this.selectedChat.chatRoomId) return;

          console.log("messge shoudl not be here", msg, "\n", this.selectedChat);
          

          const normalized = {
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : (msg.lastActionDate ? new Date(msg.lastActionDate) : new Date()),
            isFromCurrentUser: typeof msg.isFromCurrentUser === 'boolean' ? msg.isFromCurrentUser : (typeof msg.isCurrentUser === 'boolean' ? msg.isCurrentUser : (msg.roomMemberId === this.selectedChat.roomMemberId))
          };
          const current = this.messagesSubject.getValue();
          this.messagesSubject.next([...(current || []), normalized]);
        });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================================
  // Chat room
  // ===========================================

  loadChatRooms(): void {
    this.roomService.getChatRooms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.chats = [...rooms];
          console.log(this.chats);

          // Join all rooms for real-time updates if SignalR is connected
          if (this.signalRService.isConnected()) {
            this.chats.forEach(room => {
              this.signalRService.joinRoom(room.chatRoomId).catch(err => 
                console.error(`Failed to join room ${room.chatRoomId}:`, err)
              );
            });
          }
        },
        error: (error) => {
          console.error('Error loading chat rooms:', error);
        }
      });
  }


  private loadMessages(chatId: string): void {
    if (!chatId) return;
    this.apiService.getMessages(chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          const normalized = (messages || []).map((m: any) => {
            const timestamp = m.timestamp ? new Date(m.timestamp) : (m.lastActionDate ? new Date(m.lastActionDate) : new Date());
            const isFromCurrentUser = typeof m.isFromCurrentUser === 'boolean'
              ? m.isFromCurrentUser
              : (typeof m.isCurrentUser === 'boolean' ? m.isCurrentUser : (m.roomMemberId && this.selectedChat?.roomMemberId ? m.roomMemberId === this.selectedChat.roomMemberId : false));
            return {
              ...m,
              timestamp,
              isFromCurrentUser
            };
          });
          this.messagesSubject.next(normalized);
          // messages.forEach(msg => {
          //   if (this.currentRoomMember === msg.roomMemberId) {
          //     msg.isCurrentUser = true;
          //   }
          // });
          // this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Error loading messages:', error);
        }
      });
  }


  // ===========================================
  // WIDGET VISIBILITY METHODS
  // ===========================================

  toggleWidget(): void {
    this.navigationService.toggleWidget();
  }

  closeWidget(): void {
    this.navigationService.closeWidget();
  }

  // ===========================================
  // NAVIGATION METHODS
  // ===========================================

  goToChatList(): void {
    this.navigationService.goToChatList();
  }

  // =========================================
  // EVENT HANDLERS FROM CHILD COMPONENTS
  // ===========================================

  onChatSelected(chat: ChatItem): void {
    this.selectedChat = chat
    this.messagesSubject.next([]);
    this.navigationService.openChat(chat.chatRoomId);
    this.loadMessages(chat.chatRoomId)

    // Join SignalR room for real-time updates
    this.signalRService.joinRoom(chat.chatRoomId).catch(err => console.error('Join room failed:', err));
  }

  onCreateGroup(): void {
    this.loadUsers()
    this.navigationService.openGroupCreation();
  }

  onAdd(): void {
    this.loadUsers()
    this.navigationService.goToCommunicationHub();
  }

  onGroupCreated(group: any): void {
    this.navigationService.openChat(group.id);
  }

  onGroupUpdated(group: any): void {
    this.navigationService.goBack();
  }

  onConfigChanged(newConfig: ChatWidgetConfig): void {
    this.config = { ...this.config, ...newConfig };
  }

  goBackToChat(): void {
    this.navigationService.goBack();
  }

  // ===========================================
  // DATA HELPER METHODS
  // ===========================================

  /**
   * Move a chat to the top of the list when it receives a new message
   */
  private moveChatToTop(chatRoomId: string, lastActionDate: any): void {
    const roomIndex = this.chats.findIndex(r => r.chatRoomId === chatRoomId);
    
    if (roomIndex !== -1) {
      // Update the last action date
      this.chats[roomIndex].lastActionDate = lastActionDate ? new Date(lastActionDate) : new Date();
      
      // Move to top
      const [room] = this.chats.splice(roomIndex, 1);
      this.chats.unshift(room);
    }
  }

  /**
   * Get pre-selected users for group creation
   */


  loadUsers() {
    this.apiService.getUsersByWorkspace(this.authService.getCurrentUser().workspaceId).subscribe({
      next: (users) => {
        this.workspaceUsersSubject.next([...users]);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  getPreSelectedUsers(): string[] | undefined {
    return this.widgetState.currentData?.previousData;
  }

  /**
   * Get dynamic header title based on current view delete
   */
  getHeaderTitle(): string {
    switch (this.widgetState.currentView) {
      case ViewType.CHAT_LIST:
        return 'Messages';
      case ViewType.CONVERSATION:
        return 'Chat'; // You could get actual chat name from service
      case ViewType.GROUP_MANAGEMENT:
        return 'Manage Group';
      case ViewType.GROUP_CREATION:
        return 'New Group';
      default:
        return 'Chat';
    }
  }
}