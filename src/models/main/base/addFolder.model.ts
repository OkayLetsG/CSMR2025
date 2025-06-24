import { Language } from './language.model';
/**
 * @interface AddFolder
 * 
 * Can be imported as a type.
 * Interface used to add a new folder.
 */

export interface AddFolder {
    Name: string;
    ParentId: number | null;
    LanguageId: number;
    LanguageKey: string;
    LanguageName: string;
}