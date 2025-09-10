import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatWidgetConfig } from '../../widget-container/widget-container.component';
import { CommonModule } from '@angular/common';
import { RoomService } from './services/room.service';
import { Subject, takeUntil } from 'rxjs';


export interface ChatItem {
  chatRoomId: string;
  title: string;
  lastMessage: string;
  avatarUrl?: string;
  lastActionDate: Date;
  totalMessages?: number;
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
  @Output() createGroup = new EventEmitter<void>();

  actionTimeout: any;

  searchQuery: string = '';

  constructor(private roomService: RoomService){}

  // Sample data for demonstration
  ngOnInit() {
  this.chats =[
      {
        chatRoomId: 'room-1',
        title: 'John Doe',
        lastMessage: 'Hey, are we still on for today?',
        avatarUrl: 'https://i.pravatar.cc/40?img=5',
        lastActionDate: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        totalMessages: 42,
        isOnline: true,
      },
      {
        chatRoomId: 'room-2',
        title: 'Jane Smith',
        lastMessage: 'Sure, I’ll send you the file shortly.',
        avatarUrl: 'https://i.pravatar.cc/40?img=12',
        lastActionDate: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        totalMessages: 13,
        isOnline: false,
      },
      {
        chatRoomId: 'room-3',
        title: 'Team Project',
        lastMessage: 'Meeting at 10 AM tomorrow.',
        avatarUrl: 'https://i.pravatar.cc/40?img=33',
        lastActionDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        totalMessages: 128,
        isOnline: true,
      },
      {
        chatRoomId: 'room-4',
        title: 'Driver Support',
        lastMessage: 'Your driver has arrived.',
        avatarUrl: 'https://i.pravatar.cc/40?img=44',
        lastActionDate: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        totalMessages: 8,
        isOnline: false,
      },
    ];
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
    this.createGroup.emit();
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
