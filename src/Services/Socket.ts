import { io } from "socket.io-client";

class _Socket {

    userId: string = '';
    roomId: string = '';
    socket;
    subscrbers: any[] = [];

    constructor(url: string) {
        this.socket = io(url, { autoConnect: false });

        this.socket.on('accept', ({ room, roomId, userId }: any) => {
            this.userId = userId;
            this.roomId = roomId;
            this.subscrbers.forEach(subscriber => subscriber('accept', { room, roomId, userId }));
        });

        this.socket.on('message', (data: any) => {
            this.subscrbers.forEach(subscriber => subscriber('message', data));
        });

        this.socket.on('user', (user: any) => {
            this.subscrbers.forEach(subscriber => subscriber('user', { user }));
        });

        this.socket.on('decline', (data: any) => {
            this.subscrbers.forEach(subscriber => subscriber('decline', data));
        });

        this.socket.on('userLeave', (user: any) => {
            this.subscrbers.forEach(subscriber => subscriber('userLeave', { user }));
        });

        this.socket.on('roomClosed', (data: any) => {
            this.subscrbers.forEach(subscriber => subscriber('roomClosed', { data }));
        });
    }

    auth(name: string, roomId: string | null, pwd?: string) {
        this.socket.auth = { name, roomId, pwd };
        this.socket.connect();
    }

    disconnect() {
        this.socket.disconnect();
    }

    send(data: any) {
        this.socket.emit('message', {
            content: { ...data },
            from: this.userId,
            to: this.roomId
        })
    }

    leave(data: any) {
        this.socket.emit('leave', {
            content: { ...data },
            from: this.userId,
            to: this.roomId
        })
    }

    subscribe(subscriber: any) {
        this.subscrbers.push(subscriber);
        return () => this.unsubscribe(subscriber);
    }

    unsubscribe(subscriber: any) {
        const idx = this.subscrbers.findIndex(s => s === subscriber);
        this.subscrbers.slice(idx, 1);
    }

}

export const Socket = new _Socket('https://89.207.218.15:3000');