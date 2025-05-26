import { useState } from 'react';
import styles from './styles/MainPage.module.css';
import { Button } from '@/ui/button';
import { RulesModal } from '@/components/rules-modal';
import {useNavigate} from "react-router-dom";

const MainPage = () => {
    const [isRulesOpen, setIsRulesOpen] = useState(false);

    const handleRulesClick = () => {
        setIsRulesOpen(true);
    };

    const handleCloseModal = () => {
        setIsRulesOpen(false);
    };

    const navigate = useNavigate();

    return (
        <div className={styles['main-page']}>
            <div className={styles['main-page__container']}>
                <h1 className={styles['main-page__title']}>Морской Бой</h1>

                <nav className={styles['main-menu']}>
                    <ul className={styles['main-menu__list']}>
                        <li className={styles['main-menu__item']}>
                            <Button
                                color="var(--color-blue)"
                                hoverColor="var(--color-blue-dark)"
                                onClick={() => {navigate('/setup')}}
                            >
                                Игра по сети
                            </Button>
                        </li>
                        <li className={styles['main-menu__item']}>
                            <Button
                                color="var(--color-green)"
                                hoverColor="var(--color-green-dark)"
                                onClick={() => {navigate('/setup')}}
                            >
                                Игра с ботом
                            </Button>
                        </li>
                        <li className={styles['main-menu__item']}>
                            <Button
                                color="var(--color-red)"
                                hoverColor="var(--color-red-dark)"
                                onClick={handleRulesClick}
                            >
                                Правила
                            </Button>
                        </li>
                    </ul>
                </nav>

                <div className={styles['main-page__ship']}></div>
            </div>

            <RulesModal isOpen={isRulesOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default MainPage;