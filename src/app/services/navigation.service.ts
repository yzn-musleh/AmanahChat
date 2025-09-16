import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Types and Interfaces
export enum ViewType {
  CHAT_LIST = 'chat-list',
  CONVERSATION = 'conversation',
  GROUP_MANAGEMENT = 'group-management',
  GROUP_CREATION = 'group-creation',
  COMMUNICATION_HUB = 'communication-hub'
}

export interface NavigationData {
  chatId?: string;
  groupId?: string;
  userId?: string;
  previousData?: any;
  [key: string]: any;
}

export interface ViewHistoryItem {
  view: ViewType;
  data?: NavigationData;
  timestamp: number;
}

export interface WidgetState {
  currentView: ViewType;
  isOpen: boolean;
  isMinimized: boolean;
  navigationHistory: ViewHistoryItem[];
  currentData?: NavigationData;
  canGoBack: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private readonly stateSubject = new BehaviorSubject<WidgetState>(this.getInitialState());
  public readonly state$: Observable<WidgetState> = this.stateSubject.asObservable();


  // Get current state snapshot
  get currentState(): WidgetState {
    return this.stateSubject.value;
  }

  // Get initial state of the widget
  private getInitialState(): WidgetState {
    return {
      currentView: ViewType.CHAT_LIST,
      isOpen: false,
      isMinimized: true,
      navigationHistory: [],
      canGoBack: false
    };
  }

  /**
   * Opens the widget and shows the chat list (default view)
   */
  openWidget(): void {
    this.updateState({
      isOpen: true,
      isMinimized: false,
      currentView: ViewType.CHAT_LIST
    });
  }

  /**
   * Closes the widget completely
   */
  closeWidget(): void {
    this.updateState({
      isOpen: false,
      isMinimized: true,
      // Reset to initial view when closing
      currentView: ViewType.CHAT_LIST,
      navigationHistory: [],
      currentData: undefined,
      canGoBack: false
    });
  }

  /**
   * Toggles between minimized and expanded state
   */
  toggleWidget(): void {
    const current = this.currentState;
    if (current.isMinimized) {
      this.openWidget();
    } else {
      this.minimizeWidget();
    }
  }

  /**
   * Minimizes the widget (shows only the chat bubble)
   */
  minimizeWidget(): void {
    this.updateState({
      isMinimized: true,
      isOpen: false
    });
  }

  // ===========================================
  // NAVIGATION METHODS
  // ===========================================

  /**
   * Navigate to a specific view with optional data
   * This is the main navigation method
   */
  navigateTo(view: ViewType, data?: NavigationData): void {
    const currentState = this.currentState;

    // Add current view to history (only if it's different from the target)
    if (currentState.currentView !== view) {
      const historyItem: ViewHistoryItem = {
        view: currentState.currentView,
        data: currentState.currentData,
        timestamp: Date.now()
      };

      // Add to history
      const updatedHistory = [...currentState.navigationHistory, historyItem];

      this.updateState({
        currentView: view,
        currentData: data,
        navigationHistory: updatedHistory,
        canGoBack: updatedHistory.length > 0,
        // Ensure widget is visible when navigating
        isOpen: true,
        isMinimized: false
      });
    }
  }

  /**
   * Go back to the previous view in history
   */
  goBack(): void {
    const currentState = this.currentState;

    if (currentState.navigationHistory.length === 0) {
      console.warn('⚠️ No history to go back to');
      return;
    }

    // Get the last item from history
    const history = [...currentState.navigationHistory];
    const previousView = history.pop()!;

    this.updateState({
      currentView: previousView.view,
      currentData: previousView.data,
      navigationHistory: history,
      canGoBack: history.length > 0
    });
  }

  /**
   * Clear navigation history (useful for reset scenarios)
   */
  clearHistory(): void {
    this.updateState({
      navigationHistory: [],
      canGoBack: false
    });
  }

  // ===========================================
  // SPECIFIC NAVIGATION SHORTCUTS
  // ===========================================

  /**
   * Navigate to chat list (home view)
   */
  goToChatList(): void {
    this.navigateTo(ViewType.CHAT_LIST);
  }

  goToCommunicationHub(): void {
    this.navigateTo(ViewType.COMMUNICATION_HUB);
  }

  /**
   * Open a specific chat conversation
   */
  openChat(chatId: string, additionalData?: any): void {
    this.navigateTo(ViewType.CONVERSATION, {
      chatId,
      ...additionalData
    });
  }

  /**
   * Open group management for a specific group
   */
  openGroupManagement(groupId: string): void {
    this.navigateTo(ViewType.GROUP_MANAGEMENT, { groupId });
  }

  /**
   * Open group creation screen
   */
  openGroupCreation(preSelectedUsers?: string[]): void {
    this.navigateTo(ViewType.GROUP_CREATION, {
      preSelectedUsers
    });
  }

  // ===========================================
  // STATE MANAGEMENT HELPERS
  // ===========================================

  /**
   * Update the widget state
   */
  private updateState(partialState: Partial<WidgetState>): void {
    const currentState = this.currentState;
    const newState = { ...currentState, ...partialState };


    this.stateSubject.next(newState);
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Check if currently on a specific view
   */
  isCurrentView(view: ViewType): boolean {
    return this.currentState.currentView === view;
  }

  /**
   * Get current view data
   */
  getCurrentData<T = NavigationData>(): T | undefined {
    return this.currentState.currentData as T;
  }

  /**
   * Reset widget to initial state
   */
  reset(): void {
    this.stateSubject.next(this.getInitialState());
  }

  /**
   * Get navigation history for debugging
   */
  getNavigationHistory(): ViewHistoryItem[] {
    return [...this.currentState.navigationHistory];
  }
}