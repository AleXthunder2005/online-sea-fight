import React, {type ButtonHTMLAttributes } from 'react';
import styles from './styles/Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    color: string;
    hoverColor: string;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           color,
                                           hoverColor,
                                           className = '',
                                           onClick,
                                           ...props
                                       }) => {
    const style = {
        '--button-color': color,
        '--button-hover-color': hoverColor,
    } as React.CSSProperties;

    return (
        <button
            className={`${styles.button} ${className}`}
            style={style}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;