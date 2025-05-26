import React from 'react';
import styles from './styles/Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    color: string;
    hoverColor: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, color, hoverColor, onClick }) => {
    const style = {
        '--button-color': color,
        '--button-hover-color': hoverColor,
    } as React.CSSProperties;

    return (
        <button
            className={styles['button']}
            style={style}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;