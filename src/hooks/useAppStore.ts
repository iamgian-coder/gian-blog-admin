import { useContext } from "react";
import { storeContext } from "../context";

export const useAppStore = () => useContext(storeContext);
