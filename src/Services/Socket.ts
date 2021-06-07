import { io } from "socket.io-client";

class _Socket {
  userId: string = "";
  roomId: string = "";
  socket;
  subscrbers: any[] = [];

  constructor(url: string, secure: boolean) {
    this.socket = io(url, { autoConnect: false, secure: secure, closeOnBeforeunload: false, transports: ["polling"], upgrade: false });

    this.socket.on("accept", ({ room, roomId, userId }: any) => {
      this.userId = userId;
      this.roomId = roomId;
      this.subscrbers.forEach((subscriber) =>
        subscriber("accept", { room, roomId, userId })
      );
    });

    this.socket.on("message", (data: any) => {
      this.subscrbers.forEach((subscriber) => subscriber("message", data));
    });

    this.socket.on("user", (user: any) => {
      this.subscrbers.forEach((subscriber) => subscriber("user", { user }));
    });

    this.socket.on("decline", (data: any) => {
      this.subscrbers.forEach((subscriber) => subscriber("decline", data));
    });

    this.socket.on("userLeave", (data: any) => {
      this.subscrbers.forEach((subscriber) =>
        subscriber("userLeave", { userId: data.userId })
      );
    });

    window.addEventListener(
      "beforeunload",
      (e) => {
        this.leave({ userId: this.userId });
      },
      false
    );

    window.addEventListener(
      "unload",
      (e) => {
        this.leave({ userId: this.userId });
      },
      false
    );
  }

  auth(name: string, roomId: string | null, pwd?: string) {
    this.socket.auth = { name, roomId, pwd };
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  send(data: any) {
    this.socket.emit("message", {
      content: { ...data },
      from: this.userId,
      to: this.roomId,
    });
  }

  leave(data: any) {
    this.socket.emit("leave", {
      content: { ...data },
      from: this.userId,
      to: this.roomId,
    });
  }

  subscribe(subscriber: any) {
    this.subscrbers.push(subscriber);
    return () => this.unsubscribe(subscriber);
  }

  unsubscribe(subscriber: any) {
    const idx = this.subscrbers.findIndex((s) => s === subscriber);
    this.subscrbers.splice(idx, 1);
  }
}

export const Socket = new _Socket("http://vienna-collab.oa.r.appspot.com", false);