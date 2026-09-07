import { createContext, useContext } from "react";

export const CompactPlayerContext = createContext(false);
export const useCompactPlayer = () => useContext(CompactPlayerContext);
