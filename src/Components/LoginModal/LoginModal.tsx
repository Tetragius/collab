import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Button, FormField, Grid, Groups, Input, InputPassword, Modal } from 'vienna-ui';
import { Socket } from '../../Services/Socket';

export const LoginModal = () => {

    const [pwd, setPwd] = useState('');
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMessage] = useState('');

    const history = useHistory();

    useEffect(() => {
        const subscriber = (type: string, data: any) => {
            if (type === 'accept') {
                Socket.unsubscribe(subscriber);
                history.push(data.roomId, { room: data.room });
                return;
            }
            if (type === 'decline') {
                setMessage(data.msg);
                Socket.disconnect();
            }
            setLoading(false);
        };
        Socket.subscribe(subscriber);
    }, [])

    const connectToRoom = () => {
        setLoading(true);
        Socket.auth(name, roomId, pwd);
    }

    const createRoom = () => {
        setLoading(true);
        Socket.auth(name, null, pwd);
    }

    return (
        <Modal isOpen={true} onClose={() => false} closeIcon={false}>
            <Modal.Layout>
                <Modal.Head>
                    <Modal.Title>
                        Создайте или войдите в существующую комнату
                        </Modal.Title>
                    <Modal.Body style={{ width: '654px' }}>
                        <Grid.Row>
                            <Grid.Col>
                                <FormField style={{ width: '100%' }}>
                                    <FormField.Label required>Ваше имя</FormField.Label>
                                    <FormField.Content>
                                        <Input disabled={loading} placeholder='Имя' value={name} onChange={(e, data) => setName(data.value)} />
                                    </FormField.Content>
                                </FormField>
                            </Grid.Col>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Col>
                                <FormField style={{ width: '100%' }}>
                                    <FormField.Label>ID комнаты (если известен)</FormField.Label>
                                    <FormField.Content>
                                        <Input disabled={loading} placeholder='ID комнаты' value={roomId} onChange={(e, data) => setRoomId(data.value)} />
                                    </FormField.Content>
                                </FormField>
                            </Grid.Col>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Col>
                                <FormField style={{ width: '100%' }}>
                                    <FormField.Label>Задайте или введите пароль от комнаты если необходимо</FormField.Label>
                                    <FormField.Content>
                                        <InputPassword disabled={loading} placeholder='Пароль' value={pwd} onChange={(e, data) => setPwd(data.value)} />
                                    </FormField.Content>
                                    {msg && <FormField.Message color='critical'>{msg}</FormField.Message>}
                                </FormField>
                            </Grid.Col>
                        </Grid.Row>
                    </Modal.Body>
                    <Modal.Footer style={{ width: '100%' }}>
                        <Groups justifyContent="flex-end" alignItems="flex-end" design="horizontal">
                            <Button design='accent' onClick={connectToRoom} loading={loading} disabled={!roomId || !name}>Войти</Button>
                            <Button design="primary" onClick={createRoom} loading={loading} disabled={!name}>Cоздать</Button>
                        </Groups>
                    </Modal.Footer>
                </Modal.Head>
            </Modal.Layout>
        </Modal>
    )
}