"use client";

import { useEffect, useCallback } from 'react';

export default function Security() {
    const handleContextMenu = useCallback((event: Event) => {
        event.preventDefault();
    }, []);
    
    useEffect(() => {
        document.addEventListener('contextmenu', handleContextMenu);
        
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [handleContextMenu]);

    return null;
}