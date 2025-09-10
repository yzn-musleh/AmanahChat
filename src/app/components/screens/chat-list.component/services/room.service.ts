import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private apiService: ApiService, private authService:  AuthService) { }
  
    getChatRoomsByWorkspace(): Observable<any[]> {
      return this.apiService.get<any[]>(`ChatRooms/GetChatRoomsByWorkspace`);
    }
  
    createChatRoom(chatRoom: any): Observable<string> {
      return this.apiService.post<string>('ChatRooms/Add', chatRoom);
    }
  
    addRoomMember(chatRoomId: string, members: {userId: string, isAdmin: boolean}[]): Observable<string> {
  
      const body = {
        chatRoomId,
        roomMemberDto: members,
      };
  
      return this.apiService.post<string>(`ChatRooms/Members`, body);
    }
    
    removeRoomMember(payload: { chatRoomId: string; userId: string }): Observable<void> {
      return this.apiService.deleteWithBody<void>('ChatRooms/RemoveMembers', payload);
    }

  // Get all chat rooms for current workspace
  getChatRooms(): Observable<any> {
    return this.apiService.get<any>('ChatRooms/GetChatRoomsByUser');
  }

  // Update chat room
  updateChatRoom(roomId: string, request: Partial<any>): Observable<void> {
    return this.apiService.put<void>(`/api/ChatRooms/${roomId}`, request);
  }

  // Delete chat room
  deleteChatRoom(roomId: string): Observable<void> {
    return this.apiService.delete<void>(`ChatRooms/Delete?ChatRoomId=${roomId}`);
  }

  // Get room members
  getRoomMembers(chatRoomId: string): Observable<any[]> {
    return this.apiService.get<any[]>(`Users/GetUsersByChatRoom?chatRoomId=${chatRoomId}&pageNumber=1&pageSize=50`);
  }

}

