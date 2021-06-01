import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Groups, Header, Heading, Text } from 'vienna-ui';
import { Socket } from '../../Services/Socket';
import { Box } from './Redactor.styled';
import { Monaco } from '../../Services/Monaco';

export const Redactor = () => {

    const ref = useRef<HTMLDivElement>(null);

    const location = useLocation<any>();

    useEffect(() => {
        let subscriber: any = null;
        if (ref.current) {

            const editor = Monaco.createEditor(ref.current)

            if (location.state) {

                location.state.room.users.forEach((user: any) => {
                    Monaco.appendCursor(user.id, `#${user.color}`, user.name);
                    Monaco.appendSelection(user.id, `#${user.color}`);
                });

                Monaco.updateModel(location.state.room.content);
            }

            editor.onDidChangeCursorPosition((e) => {
                const offset = editor.getModel()?.getOffsetAt(e.position);
                Socket.send({ offset, value: editor.getValue() });
            });

            editor.onDidChangeCursorSelection((e) => {
                const startOffset = editor.getModel()?.getOffsetAt(e.selection.getStartPosition());
                const endOffset = editor.getModel()?.getOffsetAt(e.selection.getEndPosition());
                Socket.send({ selection: startOffset !== endOffset && { from: startOffset, to: endOffset }, value: editor.getValue() });
            });

            const manager = new Monaco.collabContentManager(
                {
                    editor,
                    onInsert: (index: number, text: string) => {
                        Socket.send({ index, text, value: editor.getValue() })
                    },
                    onDelete(index: number, length: number) {
                        Socket.send({ index, length, value: editor.getValue() })
                    }
                }
            )

            subscriber = (type: string, data: any) => {
                switch (type) {
                    case 'message':
                        const { from, message: { offset, index, text, length, selection } } = data;
                        offset && Monaco.cursors[from].setOffset(offset);
                        index && manager.insert(index, text);
                        length && manager.delete(index, length);
                        if (selection) {
                            Monaco.selections[from].setOffsets(selection.from, selection.to);
                            Monaco.selections[from].show();
                        }
                        else {
                            Monaco.selections[from].hide();
                        }
                        return;
                    case 'user':
                        Monaco.appendCursor(data.user.id, `#${data.user.color}`, data.user.name);
                        Monaco.appendSelection(data.user.id, `#${data.user.color}`);
                        return;
                    case 'userLeave':
                        Monaco.removeCursor(data.user.id);
                        Monaco.removeSelection(data.user.id);
                        return;
                }
            }

            Socket.subscribe(subscriber);

        }

        return () => {
            Socket.unsubscribe(subscriber);
        }

    }, []);

    const action = (
        <Groups>
            <Text>ID: {Socket.roomId}</Text>
        </Groups>);

    return (
        <>
            <Header logo={<Heading>ViennaCollab MVP</Heading>} action={action} shadow={true} />
            <Box ref={ref} />
        </>
    )
}