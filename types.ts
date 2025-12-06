export interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  content: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  isAd?: boolean; // Special flag for the Lingxi Ad
  time: string;
}

export enum ViewState {
  FORUM_LIST = 'FORUM_LIST',
  FORUM_POST = 'FORUM_POST',
  AD_LANDING = 'AD_LANDING',
  AD_INSTALL = 'AD_INSTALL',
  APP_LOGIN = 'APP_LOGIN',
  APP_CHAT = 'APP_CHAT'
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}