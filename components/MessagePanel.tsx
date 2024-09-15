import React, { useState, useEffect } from 'react';

interface MessagePanelProps {
    message: string;   // The message to display
    isVisible: boolean;  // Whether the message panel is visible or not
}

const MessagePanel: React.FC<MessagePanelProps> = ({ message, isVisible }) => {
    // Conditional rendering for the message panel based on `isVisible`
    return (
        <>
            {isVisible && (
                <div className="message-panel">
                    <p>{message}</p>
                </div>
            )}
            <style jsx>{`
                .message-panel {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    font-size: 16px;
                    border-radius: 5px;
                    width: 60%;
                    text-align: center;
                    z-index: 100;
                }
            `}</style>
        </>
    );
};

export default MessagePanel;
