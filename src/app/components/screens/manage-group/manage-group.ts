import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

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


@Component({
  selector: 'app-manage-group',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './manage-group.html',
  styleUrl: './manage-group.scss'
})
export class ManageGroup {
  @Input() title: string = 'Select Team Members';
  @Input() searchPlaceholder: string = 'Search by driver name or group';
  @Input() members: TeamMember[] = [];
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
  filteredMembers: TeamMember[] = [];
  showGroupNameInput: boolean = false;

  ngOnInit() {
    // Sample data if no members provided
    if (this.members.length === 0) {
      this.members = [
        {
          id: 'team-1',
          name: 'Team vv1vvvvvbbbb1',
          type: 'team',
          memberCount: 8
        },
        {
          id: 'team-2',
          name: 'Team aa11',
          type: 'team',
          memberCount: 5
        },
        {
          id: 'driver-1',
          name: 'driver11',
          type: 'driver',
          isOnline: true
        },
        {
          id: 'driver-2',
          name: 'driver022',
          type: 'driver',
          isOnline: false
        },
        {
          id: 'driver-3',
          name: 'driver03333',
          type: 'driver',
          isOnline: true
        },
        {
          id: 'team-3',
          name: 'Team aa0111',
          type: 'team',
          memberCount: 12
        }
      ];
    }

    this.filteredMembers = [...this.members];
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
  }

  canCreateGroup(): boolean {
    return false
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
    if (!this.searchQuery.trim()) {
      this.filteredMembers = [...this.members];
      return;
    }

    const query = this.searchQuery.toLowerCase();
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