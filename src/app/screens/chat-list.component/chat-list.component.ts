import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ChatItem, ChatWidgetConfig } from '../../Utils/Models';

@Component({
  selector: 'app-chat-list',
  imports: [CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent implements OnChanges {

  private destroy$ = new Subject<void>();
  
  @Input() config?: ChatWidgetConfig;

  @Input() title: string = 'Abovve';
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
  filteredChats: ChatItem[] = [];


  // Sample data for demonstration
  ngOnInit() {
    this.applyTheme();
    this.filteredChats = [...this.chats];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chats']) {
      this.filteredChats = [...this.chats];
      this.filterMembers();
    }
  }

  applyTheme() {
    const root = document.documentElement;

    root.style.setProperty('--primary-color', this.config?.theme?.primaryColor ?? '');
    root.style.setProperty('--secondary-color', this.config?.theme?.secondaryColor ?? '');
    root.style.setProperty('--background-color', this.config?.theme?.backgroundColor ?? '');
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
      this.filteredChats = [...this.chats];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredChats = this.chats.filter(chat =>
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
