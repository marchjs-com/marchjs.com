// Whether MarchIDE is on screen: it takes the whole page then, so the shell does not pin its menu beside it
// (shell-menu.tsx). A start-up module of its own: the shell reads it without loading MarchIDE.
import { signal } from "march";

export const ideOpen = signal(false);
