import { useState, useEffect } from 'react';
import io from 'socket.io-client';

import styles from './styles.module.scss';
import { api } from '../../services/api';

import logoImg from '../../assets/logo.svg';

interface IUser {
  name: string;
  avatar_url: string;
  login: string;
}

interface IMessage {
  text: string;
  user: IUser;
  id: string;
}

const messagesQueue: IMessage[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', newMessage => messagesQueue.push(newMessage));

export function MessageList() {
  const [last3Messages, setLast3Messages] = useState<IMessage[]>([]);

  useEffect(() => {
    setInterval(() => {
      if (messagesQueue.length > 0) {
        setLast3Messages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1],
        ]);

        messagesQueue.shift();
      }
    }, 3000);

  }, []);

  useEffect(() => {
    api.get<IMessage[]>('/messages/last3').then(response => {
      setLast3Messages(response.data);
    });

    const url = window.location.href;
    const hasMessageParam = url.includes('?message=');

    if (hasMessageParam) {
      const [urlWithoutToken, token] = url.split('?message=');

      window.history.pushState({}, '', urlWithoutToken);
    }
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <div className={styles.messageListHeader}>
        <a href='https://dowhile.io' target='_blank'>
          <img src={logoImg} alt="" />
        </a>
      </div>

      <ul className={styles.messageList}>
        { last3Messages.map(message => {
          return (
            <li className={styles.message} key={message.id}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <a
                  className={styles.userImage}
                  href={`http://github.com/${message.user.login}`}
                  target='_blank'
                >
                  <img src={message.user.avatar_url} alt={`Avatar de ${message.user.name}`} />
                </a>
                <span>{message.user.name}</span>  
              </div>
            </li>
          );
        }) }
      </ul>
    </div>
  );
}