import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatItem } from '../chat-list.component/chat-list.component';
import { ApiService } from '../../../services/api.service';
import { WorkspaceUser } from '../../widget-container/widget-container.component';

@Component({
  selector: 'app-communication-component',
  imports: [CommonModule, ],
  templateUrl: './communication-component.html',
  styleUrl: './communication-component.scss'
})
export class CommunicationComponent {

   @Input() workspaceUsers: WorkspaceUser[] | null = [];
 // @Input() chats: ChatItem[] = [];

  @Output() onGroupCreation = new EventEmitter<void>();
  // @Output() onNewDirectChat = new EventEmitter<void>()
  // @Output() onNewBroadcast = new EventEmitter<void>();
  @Output() backToList = new EventEmitter<void>();

  searchQuery: string = '';

  constructor(private apiService: ApiService) {}


  onBack() {
    this.backToList.emit();
  }

  onSearch() {
    // if (this.searchQuery.trim()) {
    //   this.filteredContacts = this.contacts.filter(contact =>
    //     contact.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    //   );
    // } else {
    //   this.filteredContacts = [...this.contacts];
    // }
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
