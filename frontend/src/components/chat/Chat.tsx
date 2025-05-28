import styles from './styles/Chat.module.css'
import React, {useCallback, useState, useEffect, useRef} from "react";
import {Button} from "@/ui/button";

interface ChatProps {
    onSendMessage: (message: string) => void;
    messages: {sender: string, message: string}[];
}

const Chat = ({onSendMessage, messages} : ChatProps) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Автоматическая прокрутка сообщений вниз при новых сообщениях
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                {messages.map((msg, index) => (
                    <div key={index} className={styles['chat-message']}>
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className={styles['chat-input']}>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    rows={3}
                />

                <Button
                    color='#2ecc71'
                    hoverColor='#27ae60'
                    disabled={message.trim().length === 0}
                    className={styles['send-button']}
                    onClick={handleSendMessage}
                >
                    Отправить
                </Button>
            </div>
        </div>
    );
};

export default Chat;