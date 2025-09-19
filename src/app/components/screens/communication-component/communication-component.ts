import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatItem } from '../chat-list.component/chat-list.component';
import { ApiService } from '../../../services/api.service';
import { WorkspaceUser } from '../../widget-container/widget-container.component';

@Component({
  selector: 'app-communication-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './communication-component.html',
  styleUrl: './communication-component.scss'
})
export class CommunicationComponent implements OnChanges {

   @Input() workspaceUsers: WorkspaceUser[] | null = [];
 // @Input() chats: ChatItem[] = [];

  @Output() onGroupCreation = new EventEmitter<void>();
  // @Output() onNewDirectChat = new EventEmitter<void>()
  // @Output() onNewBroadcast = new EventEmitter<void>();
  @Output() backToList = new EventEmitter<void>();

  searchQuery: string = '';
  filteredUsers: WorkspaceUser[] = [];

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspaceUsers']) {
      this.filteredUsers = [...(this.workspaceUsers || [])];
      this.filterUsers();
    }
  }

  onBack() {
    this.backToList.emit();
  }

  onSearch() {
    this.filterUsers();
  }

  private filterUsers() {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...(this.workspaceUsers || [])];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = (this.workspaceUsers || []).filter(user =>
      (user.username || '').toLowerCase().includes(query) ||
      (user.firstName || '').toLowerCase().includes(query) ||
      (user.lastName || '').toLowerCase().includes(query)
    );
  }

  onNewDirectChat (){}

  chatWithUser(userId: string) {
    this.apiService.createDirectChat(userId).subscribe({
      next: (response) => {
        console.log('Direct chat created:', response);

        // Optionally, you can navigate to the chat component here
        
      },
      error: (err) => {
        console.error('Failed to create direct chat:', err);
      }
    });
  }

  onNewGroup() {
    this.onGroupCreation.emit();
    
  }

  onNewBroadcast() {
    console.log('New broadcast clicked');
  }


  getAvatarText(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
