import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';

export interface ApiResult<T> {
    errorCode: number;
    errorCodeLevel: number;
    message: string;
    result: T;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly baseUrl = environment.apiUrl || 'https://localhost:7003/api';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
    }

    private handleResponse<T>(response: ApiResult<T>): T {
        if (response.errorCode === 0) {
            return response.result;
        } else {
            throw new Error(response.message || 'API Error');
        }
    }

    private handleError(error: any): Observable<never> {
        console.error('API Error:', error);
        return throwError(() => new Error(error.message || 'Server error'));
    }

    // Generic HTTP methods
    get<T>(endpoint: string, params?: HttpParams): Observable<T> {
        return this.http.get<ApiResult<T>>(`${this.baseUrl}/${endpoint}`, {
            headers: this.getHeaders(),
            params
        }).pipe(
            map(response => this.handleResponse(response)),
            catchError(this.handleError)
        );
    }

    post<T>(endpoint: string, data: any): Observable<T> {
        return this.http.post<ApiResult<T>>(`${this.baseUrl}/${endpoint}`, data, {
            headers: this.getHeaders()
        }).pipe(
            map(response => this.handleResponse(response)),
            catchError(this.handleError)
        );
    }

    put<T>(endpoint: string, data: any): Observable<T> {
        return this.http.put<ApiResult<T>>(`${this.baseUrl}/${endpoint}`, data, {
            headers: this.getHeaders()
        }).pipe(
            map(response => this.handleResponse(response)),
            catchError(this.handleError)
        );
    }

    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<ApiResult<T>>(`${this.baseUrl}/${endpoint}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => this.handleResponse(response)),
            catchError(this.handleError)
        );
    }

    deleteWithBody<T>(endpoint: string, body: any): Observable<T> {
        return this.http.request<ApiResult<T>>('delete', `${this.baseUrl}/${endpoint}`, {
            headers: this.getHeaders(),
            body
        }).pipe(
            map(response => this.handleResponse(response)),
            catchError(this.handleError)
        );
    }

    // Workspace endpoints
    getWorkspaces(): Observable<any> {
        return this.get<any>('Workspaces');
    }

    createWorkspace(workspace: any): Observable<string> {
        return this.post<string>('Workspaces/Add', workspace);
    }

    // User endpoints
    getUsers(): Observable<any[]> {
        return this.get<any[]>('Users');
    }

    getUsersByWorkspace(workspaceId: string): Observable<any[]> {
        return this.get<any[]>(`Users/GetUsersByWorkspace?workspaceId=${workspaceId}`);
    }

    createUser(user: any): Observable<string> {
        return this.post<string>('Users/Add', user);
    }

    deleteUser(userId: string): Observable<void> {
        return this.delete<void>(`Users/Delete?UserId=${userId}`);
    }

    // // ChatRoom endpoints
    // getChatRooms(): Observable<any[]> {
    //   return this.get<any[]>( 'ChatRooms/GetChatRoomsByUser?userId='+ this.authService.getCurrentUser().userId);
    // }

    // getChatRoomsByWorkspace(workspaceId: string): Observable<any[]> {
    //   return this.get<any[]>(`ChatRooms/GetChatRoomsByWorkspace?workspaceId=${workspaceId}`);
    // }

    // createChatRoom(chatRoom: CreateChatRoomRequest): Observable<string> {
    //   return this.post<string>('ChatRooms/Add', chatRoom);
    // }

    // addRoomMember(chatRoomId: string, members: {userId: string, isAdmin: boolean}[]): Observable<string> {

    //   const body = {
    //     chatRoomId,
    //     roomMemberDto: members,
    //   };

    //   return this.post<string>(`ChatRooms/Members`, body);
    // }

    // removeRoomMember(payload: { chatRoomId: string; userId: string }): Observable<void> {
    //   return this.deleteWithBody<void>('ChatRooms/RemoveMembers', payload);
    // }

    createDirectChat(userId2: string) {
        const body = { userId2 };
        return this.http.post<any>(this.baseUrl + "/DirectChat/direct", body);
    }

    // Message endpoints
    sendMessage(message: any): Observable<string> {
        return this.post<string>('Messages/Send', message);
    }

    getMessages(chatRoomId: string, page: number = 1, pageSize: number = 50): Observable<any[]> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.get<any[]>(`Messages/RoomMessages/${chatRoomId}`, params);
    }

    getRoomMessages(chatRoomId: string, page: number = 1, pageSize: number = 50): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.get<any>(`Messages/Room/${chatRoomId}`, params);
    }

    deleteMessage(payload: { chatRoomId: string; roomMemberId: string; messageId: string }): Observable<void> {
        return this.deleteWithBody<void>('Messages/Delete', payload);
    }
}

