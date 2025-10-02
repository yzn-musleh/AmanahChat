import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { SendMessageRequest } from '../Utils/Models';

@Injectable({
    providedIn: 'root'
})
export class MessageService {

    constructor(private apiService: ApiService, private authService: AuthService) { }


    // Message endpoints
    sendMessage(request: SendMessageRequest): Observable<string> {
        const formData = new FormData();

        formData.append("roomMemberId", request.roomMemberId);
        formData.append("chatRoomId", request.chatRoomId);
        formData.append("message", request.message);

        if (request.file) {
            formData.append("file", request.file);
        }

        return this.apiService.postForm<string>('Messages/Send', formData);
    }

    getMessages(chatRoomId: string, page: number = 1, pageSize: number = 50): Observable<any[]> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.apiService.get<any[]>(`Messages/RoomMessages/${chatRoomId}`, params);
    }

    getRoomMessages(chatRoomId: string, page: number = 1, pageSize: number = 50): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.apiService.get<any>(`Messages/Room/${chatRoomId}`, params);
    }

    deleteMessage(payload: { chatRoomId: string; roomMemberId: string; messageId: string }): Observable<void> {
        return this.apiService.deleteWithBody<void>('Messages/Delete', payload);
    }
}