"use client";

import { useState } from 'react';
import styles from './Dropdown.module.scss';
import clsx from 'clsx';

type DropdownProps = {
    btnLabel: string;
    menus: string[];
    onMenuItemClick?: (menuItem: string) => void;
};

const UP_ARROW_CORDINATES = "M6 15L12 9L18 15";
const DOWN_ARROW_CORDINATES = "M6 9L12 15L18 9";

const Dropdown = ({ btnLabel, menus, onMenuItemClick }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleMenuItemClick = (menuItem: string) => {
        if (onMenuItemClick) {
            onMenuItemClick(menuItem);
        }
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdown}>
            <div className={styles.dropdown__btn} onClick={() => setIsOpen(!isOpen)}>
                <span className={styles.dropdown__label}>{btnLabel}</span>
                <svg className={styles.dropdown__arrow} width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d={isOpen ? UP_ARROW_CORDINATES : DOWN_ARROW_CORDINATES} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <ul className={clsx(styles.dropdown__menu, { [styles['dropdown__menu--isOpen']]: isOpen })}>
                {menus?.map((menu) => (
                    <li key={menu} className={styles.dropdown__menuItem} onClick={() => handleMenuItemClick(menu)} style={{ cursor: 'pointer' }}>
                        {menu}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dropdown;
