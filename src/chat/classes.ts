class TextIncomingMessage {
  private text: string;
  private roomId: string;

  constructor(text: string, roomId: string) {
    this.text = text;
    this.roomId = roomId;
  }
}

abstract class BaseIncomingMessageWithFile extends TextIncomingMessage {
  abstract handleFile(): void;
  protected file: string;

  constructor(text: string, roomId: string) {
    super(text, roomId);
  }
}

class ImageIM extends BaseIncomingMessageWithFile {
  private readonly type = 'image';
  constructor(text: string, roomId: string) {
    super(text, roomId);
  }

  handleFile() {
    console.log('image handling');
    const file = '123';
    this.file = file;
  }
}

class VideoIM extends BaseIncomingMessageWithFile {
  private readonly type = 'video';
  constructor(text: string, roomId: string) {
    super(text, roomId);
  }

  handleFile() {
    console.log('video handling');
    const file = '123';
    this.file = file;
  }
}

class TextOutgoingMessage {
  message: string;
  nickname: string;
  createdAt: string;
  profilePic: string;
  roomId: number;
  userId: number;

  constructor(
    message: string,
    nickname: string,
    profilePic: string,
    roomId: number,
    userId: number,
  ) {
    this.createdAt = new Date().toLocaleString();
    this.message = message;
    this.nickname = nickname;
    this.profilePic = profilePic;
    this.roomId = roomId;
    this.userId = userId;
  }
}

class OutgoingMessageWithFile extends TextOutgoingMessage {
  file: string;

  constructor(
    message: string,
    nickname: string,
    profilePic: string,
    roomId: number,
    userId: number,
    file: string,
  ) {
    super(message, nickname, profilePic, roomId, userId);
    this.file = file;
  }
}

class ImageOM extends OutgoingMessageWithFile {
  type: 'image';

  constructor(
    message: string,
    nickname: string,
    profilePic: string,
    roomId: number,
    userId: number,
    file: string,
  ) {
    super(message, nickname, profilePic, roomId, userId, file);
  }
}

export type IncomingMessage = TextIncomingMessage | ImageIM;
export type OutgoingMessage = TextOutgoingMessage | ImageOM;
