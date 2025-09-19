import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatWidgetConfig } from '../../widget-container/widget-container.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { RoomService } from '../../../services/room.service';


export interface ChatItem {
  chatRoomId: string;
  roomMemberId: string
  title: string;
  lastMessage: string;
  avatarUrl?: string;
  lastActionDate: Date;
  totalMessages?: number;
  type?: 'group' | 'direct';
  isOnline?: boolean;
}

@Component({
  selector: 'app-chat-list',
  imports: [CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {

  private destroy$ = new Subject<void>();
  
  @Input() config?: ChatWidgetConfig;

  @Input() title: string = 'Title';
  @Input() searchPlaceholder: string = 'Search by drive name or group';
  @Input() showAddButton: boolean = true;

  @Input() chats: ChatItem[] = [];

  @Output() onSearch = new EventEmitter<string>();
  @Output() chatSelected = new EventEmitter<ChatItem>();
  @Output() onAdd = new EventEmitter<void>();

  actionTimeout: any;

  searchQuery: string = '';
  isConnected = true;
  shouldScrollToBottom = false;

  constructor(private roomService: RoomService){}

  // Sample data for demonstration
  ngOnInit() {
    // SignalR is now handled by the parent widget-container component
    // No need to initialize it here
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.actionTimeout) clearTimeout(this.actionTimeout);
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    this.filterMembers()
    this.onSearch.emit(this.searchQuery);
  }

  private filterMembers() {
    if (!this.searchQuery.trim()) {
      this.chats = [...this.chats];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.chats = this.chats.filter(chat =>
      chat.title.toLowerCase().includes(query)
    );
  }

  selectChat(driver: ChatItem) {
    this.chatSelected.emit(driver);
  }

  addNew() {
    this.onAdd.emit();
  }

  getAvatarText(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  formatMessageTime(date: Date): string {
    const d = new Date(date);
    const datePart = d.toLocaleDateString('en-GB'); // dd/mm/yyyy format
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  }

}
