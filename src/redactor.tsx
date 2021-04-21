import React, { useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router';
import styled, { createGlobalStyle } from 'styled-components'
import * as monaco from 'monaco-editor';
import { socket } from './ws';

const MonacoCollabExt = require('@convergencelabs/monaco-collab-ext');
import '@convergencelabs/monaco-collab-ext/css/monaco-collab-ext.min.css';

const GlobalStyle = createGlobalStyle`
    html, body, #app {
        padding: 0;
        margin: 0;
        height: 100%;
        box-sizing: border-box;
    }
`;

const Box = styled.div`
    height: 100%;
    overflow: hidden;
`;

const cursors: any = {};
const selections: any = {};

const appendCursor = function (this: any, userId: string, color: string) { cursors[userId] = this.addCursor(userId, `#${color}`, userId); }
const appendSelection = function (this: any, userId: string, color: string) { selections[userId] = this.addSelection(userId, `#${color}`); }

export const Redactor = () => {

    const ref = useRef<HTMLDivElement>(null);
    const history = useHistory();

    const { roomId } = useParams<any>();

    useEffect(() => {
        if (ref.current) {

            //editor

            const editor = monaco.editor.create(ref.current, {
                value: 'Hello',
                theme: "vs-dark'",
                language: 'javascript'
            });

            const remoteCursorManager = new MonacoCollabExt.RemoteCursorManager({
                editor: editor,
                tooltips: true,
                tooltipDuration: 2
            });

            const remoteSelectionManager = new MonacoCollabExt.RemoteSelectionManager({ editor: editor });

            const send = (data: any) => {
                socket.emit('message', {
                    content: { ...data, value: editor.getValue() },
                    from: socket.userId,
                    to: socket.roomId,
                });
            }

            editor.onDidChangeCursorPosition((e) => {
                const offset = editor.getModel()?.getOffsetAt(e.position);
                send({ offset });
            });

            editor.onDidChangeCursorSelection((e) => {
                const startOffset = editor.getModel()?.getOffsetAt(e.selection.getStartPosition());
                const endOffset = editor.getModel()?.getOffsetAt(e.selection.getEndPosition());
                send({ selection: startOffset !== endOffset && { from: startOffset, to: endOffset } });
            });

            const manager = new MonacoCollabExt.EditorContentManager(
                {
                    editor,
                    onInsert: (index: number, text: string) => {
                        send({ index, text })
                    },
                    onDelete(index: number, length: number) {
                        send({ index, length })
                    }
                }
            )

            // socket

            socket.auth = { roomId };
            socket.connect();

            socket.on('message', ({ from, message: { offset, index, text, length, selection } }: any) => {
                offset && cursors[from].setOffset(offset);
                index && manager.insert(index, text);
                length && manager.delete(index, length);
                if (selection) {
                    selections[from].setOffsets(selection.from, selection.to);
                    selections[from].show();
                }
                else {
                    selections[from].hide();
                }
            });

            socket.on('accept', ({ room, roomId, userId }: any) => {
                socket.userId = userId;
                socket.roomId = roomId;

                history.replace(roomId);

                room.users.forEach((user: any) => {
                    appendCursor.call(remoteCursorManager, user.id, user.color);
                    appendSelection.call(remoteSelectionManager, user.id, user.color);
                });

                editor.setValue(room.content);
            });

            socket.on('user', (user: any) => {
                appendCursor.call(remoteCursorManager, user.id, user.color);
                appendSelection.call(remoteSelectionManager, user.id, user.color);
            });
        }
    }, [])

    return <>
        <GlobalStyle />
        <Box ref={ref} />
    </>
}