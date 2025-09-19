import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RoomService } from '../../../services/room.service';
import { takeUntil } from 'rxjs';
import { WorkspaceUser } from '../../widget-container/widget-container.component';

export interface TeamMember {
  id: string;
  name: string;
  type: 'team' | 'driver';
  avatar?: string;
  isOnline?: boolean;
  memberCount?: number; // For teams
}

export interface GroupCreation {
  name: string;
  selectedMembers: TeamMember[];
}

export interface AddRoomMemberRequest {
  userId: string;
  isAdmin: boolean;
}


export interface CreateRoomRequest {
  title: string;
  description: string;
  workspaceId: string;
  roomMembers: AddRoomMemberRequest[];
}

@Component({
  selector: 'app-manage-group',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './manage-group.html',
  styleUrl: './manage-group.scss'
})
export class ManageGroup implements OnChanges {
  @Input() title: string = 'Select Team Members';
  @Input() searchPlaceholder: string = 'Search by driver name or group';
  @Input() workspaceUsers: WorkspaceUser[] | null = [];
  @Input() allowGroupCreation: boolean = true;
  @Input() showNewGroupSection: boolean = true;
  @Input() maxSelections?: number;

  @Output() onSelectionChange = new EventEmitter<TeamMember[]>();
  @Output() onCreateGroup = new EventEmitter<GroupCreation>();
  @Output() backToList = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<string>();

  @ViewChild('groupNameInput', { static: false }) groupNameInput!: ElementRef;

  searchQuery: string = '';
  newGroupName: string = '';
  selectedMembers: Set<string> = new Set();
  members: TeamMember[] = [];
  filteredMembers: TeamMember[] = [];
  showGroupNameInput: boolean = false;

  destroy$ = new EventEmitter<void>();

  constructor(private authService: AuthService, private roomService: RoomService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspaceUsers']) {
      const users = this.workspaceUsers || [];
      this.members = users.map(u => ({
        id: u.id,
        name: u.username || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
        type: 'team'
      }));
      this.filteredMembers = [...this.members];
    }
  }

  onBackClick() {
    this.backToList.emit();
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    this.filterMembers();
    this.onSearch.emit(this.searchQuery);
  }

  toggleNewGroup() {
    this.showGroupNameInput = !this.showGroupNameInput;
    if (this.showGroupNameInput) {
      setTimeout(() => {
        this.groupNameInput?.nativeElement.focus();
      });
    } else {
      this.newGroupName = '';
    }
  }

  toggleMemberSelection(member: TeamMember) {
      // Multiple selection
      if (this.selectedMembers.has(member.id)) {
        this.selectedMembers.delete(member.id);
      } else {
        // Check max selections limit
        if (this.maxSelections && this.selectedMembers.size >= this.maxSelections) {
          return; // Don't allow more selections
        }
        this.selectedMembers.add(member.id);
      }

    this.emitSelectionChange();
  }

  isMemberSelected(memberId: string): boolean {
    return this.selectedMembers.has(memberId);
  }

  createGroup() {
    const request: CreateRoomRequest = {
      title: this.newGroupName || 'New Group',
      description: '',
      workspaceId: this.authService.getCurrentUser().workspaceId,
      roomMembers: this.selectedMembers.size > 0 ? Array.from(this.selectedMembers).map(id => ({ userId: id, isAdmin: false })) : []
    };

    this.roomService.createChatRoom(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roomId) => {
          console.log('Room created successfully:', roomId);
          this.backToList.emit();
        },
        error: (error) => {
          console.error('Error creating room:', error);
          // this.error = 'Failed to create room. Please try again.';
          // this.isSubmitting = false;
        }
      });
  }

  canCreateGroup(): boolean {
    return true
  }

  getSelectedCount(): number {
    return this.selectedMembers.size;
  }

  clearSelection() {
    this.selectedMembers.clear();
    this.emitSelectionChange();
  }

  selectAll() {
      this.filteredMembers.forEach(member => {
        if (!this.maxSelections || this.selectedMembers.size < this.maxSelections) {
          this.selectedMembers.add(member.id);
        }
      });
      this.emitSelectionChange();
    
  }

  getAvatarText(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  private filterMembers() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredMembers = [...this.members];
      return;
    }
    this.filteredMembers = this.members.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.type.toLowerCase().includes(query)
    );
  }

  private emitSelectionChange() {
    const selectedMemberObjects = this.members.filter(m =>
      this.selectedMembers.has(m.id)
    );
    this.onSelectionChange.emit(selectedMemberObjects);
  }

  // Track function for ngFor performance
  trackMember(index: number, member: TeamMember): string {
    return member.id;
  }
}