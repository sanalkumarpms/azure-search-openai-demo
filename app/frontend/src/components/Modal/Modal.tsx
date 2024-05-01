import React, { ReactNode } from "react";

import styles from "./Modal.module.css";

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
    const outsideRef = React.useRef(null);

    const routeChange = () => {
        window.location.href = "https://www.panynj.gov/port-authority/en/business-opportunities.html";
        const extPath = window.location.href;
        return extPath;
    };

    return isOpen ? (
        <div className={styles.modalContainer}>
            <div ref={outsideRef} className={styles.modalOverlay} />
            <div className={styles.modalBox}>
                <div className={styles.modalTitle}>{title}</div>
                <div className={styles.modalContent}>{children}</div>
                <div className={styles.modalActions}>
                    <button className={styles.modalCancelBtn} onClick={routeChange} role="button">
                        CANCEL
                    </button>
                    <button className={styles.modalCloseBtn} onClick={onClose} role="button">
                        CONTINUE
                    </button>
                </div>
            </div>
        </div>
    ) : null;
};
