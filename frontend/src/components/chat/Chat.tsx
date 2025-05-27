import styles from './styles/Chat.module.css'
import React, {useCallback, useState} from "react";

interface ChatProps {
    // initialChatMessages: string[];
    onSendMessage: (message: string) => void;
}

const Chat = ({onSendMessage} : ChatProps) => {
    const [message, setMessage] = useState('');
    // @ts-ignore
    const [chatMessages, setChatMessages] = useState<string[]>([]);

    const handleSendMessage = useCallback(() => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    }, [message, onSendMessage]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles['chat-container']}>
            <h3>Чат</h3>
            <div className={styles['chat-messages']}>
                {chatMessages.map((msg, index) => (
                    <div key={index} className={styles['chat-message']}>
                        {msg}
                    </div>
                ))}
            </div>
            <div className={styles['chat-input']}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Введите сообщение..."
                        rows={3}
                    />
                <button
                    onClick={handleSendMessage}
                    className={styles['send-button']}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default Chat;