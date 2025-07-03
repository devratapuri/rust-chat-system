export interface ChatMessage {
  user_id: string;
  email: string;
  content: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'auth' | 'message' | 'auth_success' | 'auth_error' | 'error';
  token?: string;
  content?: string;
  user_id?: string;
  email?: string;
  timestamp?: string;
  error?: string;
}

export type MessageHandler = (message: ChatMessage) => void;
export type ErrorHandler = (error: string) => void;
export type AuthHandler = (success: boolean, data?: { user_id: string; email: string }) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private authHandlers: AuthHandler[] = [];
  private isConnected = false;
  private isAuthenticated = false;

  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('ws://127.0.0.1:8080');
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          // Send authentication token
          this.send({ type: 'auth', token });
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
            
            if (message.type === 'auth_success') {
              this.isAuthenticated = true;
              this.authHandlers.forEach(handler => 
                handler(true, { user_id: message.user_id!, email: message.email! })
              );
              resolve(true);
            } else if (message.type === 'auth_error') {
              this.isAuthenticated = false;
              this.authHandlers.forEach(handler => handler(false));
              reject(new Error(message.error || 'Authentication failed'));
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.isAuthenticated = false;
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          this.isAuthenticated = false;
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'message':
        if (message.user_id && message.email && message.content && message.timestamp) {
          const chatMessage: ChatMessage = {
            user_id: message.user_id,
            email: message.email,
            content: message.content,
            timestamp: message.timestamp,
          };
          this.messageHandlers.forEach(handler => handler(chatMessage));
        }
        break;
      case 'error':
        this.errorHandlers.forEach(handler => handler(message.error || 'Unknown error'));
        break;
    }
  }

  sendMessage(content: string) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    this.send({ type: 'message', content });
  }

  private send(message: WebSocketMessage) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  onAuth(handler: AuthHandler) {
    this.authHandlers.push(handler);
    return () => {
      const index = this.authHandlers.indexOf(handler);
      if (index > -1) {
        this.authHandlers.splice(index, 1);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      authenticated: this.isAuthenticated,
    };
  }
}

export const wsService = new WebSocketService(); 