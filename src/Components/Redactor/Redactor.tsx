import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { Header, Heading, Text, Badge } from "vienna-ui";
import { Socket } from "../../Services/Socket";
import { Box, G, G2 } from "./Redactor.styled";
import { Monaco } from "../../Services/Monaco";

export const Redactor = () => {
  const ref = useRef<HTMLDivElement>(null);
  const manager = useRef<any>(null);

  const location = useLocation<any>();

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (ref.current) {
      const editor = Monaco.createEditor(ref.current);

      if (location.state) {
        location.state.room.users.forEach((user: any) => {
          Monaco.appendCursor(user.id, user.color, user.name);
          Monaco.appendSelection(user.id, user.color);
        });
        setUsers([...users, ...location.state.room.users]);

        Monaco.updateModel(location.state.room.content);
      }

      editor.onDidChangeCursorPosition((e) => {
        const offset = editor.getModel()?.getOffsetAt(e.position);
        Socket.send({ type: "cursor", offset, value: editor.getValue() });
      });

      editor.onDidChangeCursorSelection((e) => {
        const startOffset = editor
          .getModel()
          ?.getOffsetAt(e.selection.getStartPosition());
        const endOffset = editor
          .getModel()
          ?.getOffsetAt(e.selection.getEndPosition());
        if (startOffset !== endOffset) {
          Socket.send({
            type: "selection",
            selection: {
              from: startOffset,
              to: endOffset,
            },
            value: editor.getValue(),
          });
        }
      });

      manager.current = new Monaco.collabContentManager({
        editor,
        onInsert: (index: number, text: string) => {
          Socket.send({
            type: "insert",
            index,
            text,
            value: editor.getValue(),
          });
        },
        onReplace(index: number, length: number, text: string) {
          Socket.send({
            type: "replace",
            index,
            length,
            text,
            value: editor.getValue(),
          });
        },
        onDelete(index: number, length: number) {
          Socket.send({
            type: "delete",
            index,
            length,
            value: editor.getValue(),
          });
        },
      });
    }
  }, []);

  useEffect(() => {
    const subscriber = (msgType: string, data: any) => {
      switch (msgType) {
        case "message":
          const {
            from,
            message: { type, offset, index, text, length, selection },
          } = data;

          type === "cursor" &&
            !isNaN(offset) &&
            Monaco.cursors[from].setOffset(offset);

          type === "insert" &&
            !isNaN(index) &&
            manager.current.insert(index, text);

          type === "delete" &&
            !isNaN(length) &&
            manager.current.delete(index, length);

          type === "replace" &&
            !isNaN(length) &&
            manager.current.replace(index, length, text);

          if (type === "selection" && selection) {
            Monaco.selections[from].setOffsets(selection.from, selection.to);
            Monaco.selections[from].show();
          } else {
            Monaco.selections[from].hide();
          }

          return;
        case "user":
          Monaco.appendCursor(data.user.id, data.user.color, data.user.name);
          Monaco.appendSelection(data.user.id, data.user.color);
          setUsers([...users, data.user]);
          return;
        case "userLeave":
          try {
            Monaco.removeCursor(data.userId);
            Monaco.removeSelection(data.userId);
            const _users = users.filter((u) => u.id !== data.userId);
            setUsers([..._users]);
          } catch (e) {}
          return;
      }
    };

    Socket.subscribe(subscriber);

    return () => {
      Socket.unsubscribe(subscriber);
    };
  }, [users]);

  const action = (
    <G>
      <Text>ID комнаты: {Socket.roomId}</Text>
      <G2>
        {users.map((user) => (
          <Badge key={user.id} size="s">
            {user.name}
          </Badge>
        ))}
      </G2>
    </G>
  );

  return (
    <>
      <Header logo={<Heading>ViennaCollab</Heading>} action={action} />
      <Box ref={ref} />
    </>
  );
};
