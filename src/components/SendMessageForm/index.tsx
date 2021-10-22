import styles from './styles.module.scss';
import { VscGithubInverted, VscSignOut } from 'react-icons/vsc';
import { FormEvent, useCallback, useContext, useState } from 'react';
import { AuthContext } from '../../contexts/auth';
import { api } from '../../services/api';

export function SendMessageForm() {
  const { user, signOut } = useContext(AuthContext);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeTextArea = useCallback((event) => {
    setMessageText(event.target.value)
  }, []);

  async function handleSendMessage(event: FormEvent) {
    if (!messageText.trim()) {
      return;
    }
    
    // Prevent the default window reload
    event.preventDefault();
    
    setLoading(true);
    await api.post('/messages', { text: messageText });
    
    setMessageText('');
    setLoading(false);
  }

  return (
    <div className={styles.sendMessageFormWrapper}>
      <button className={styles.signOutButton} onClick={signOut}>
        <VscSignOut size='32' />
      </button>

      <div className={styles.userInfo}>
        <div className={styles.userImage}>
          <img src={user?.avatar_url} alt='' />
        </div>
        <strong className={styles.userName}>{user?.name}</strong>
        <span className={styles.userGithubLogin}>
          <VscGithubInverted size='16' />
          {user?.login}
        </span>
      </div>

      <form className={styles.sendMessageForm} onSubmit={handleSendMessage}>
        <label htmlFor='message'>Mensagem</label>

        <textarea
          name='message'
          id='message'
          value={messageText}
          onChange={handleChangeTextArea}
          placeholder='Qual sua expectativa para o evento?'
        />

        <button type='submit'>{loading ? 'Carregando...' : 'Enviar mensagem'}</button>
        </form>
    </div>
  );
}