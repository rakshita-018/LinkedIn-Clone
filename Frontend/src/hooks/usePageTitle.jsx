import { useEffect } from "react"

export const usePageTitle = (title) => {
    useEffect(() => {
        document.title = "LinkedIn | " + title; 
    }, [title]);
};