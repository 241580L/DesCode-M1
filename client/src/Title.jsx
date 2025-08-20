// client/src/Title.jsx
import { useEffect } from "react";

/**
 * Custom hook to set the document title.
 *
 * @param {string} title - The new title to set for the document.
 */
export default function useTitle(title) {
    useEffect(() => {
        document.title = title || "DesCode";
    }, [title]);
}