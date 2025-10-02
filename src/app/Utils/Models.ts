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

export interface SendMessageRequest {
    roomMemberId: string;
    message: string;
    chatRoomId: string;
    file?: File;
}


export interface ConversationUser {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    role?: 'driver' | 'customer' | 'support';
}


// Widget configuration interface
export interface ChatWidgetConfig {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textPrimaryColor: string;
        textSecondryColor: string;
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


export interface ApiResult<T> {
    errorCode: number;
    errorCodeLevel: number;
    message: string;
    result: T;
}