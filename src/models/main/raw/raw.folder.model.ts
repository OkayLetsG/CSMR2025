/**
 * @interface RawFolder
 * 
 * Can be imported as a type.
 * Defines the data structure of a single folder from the database.
 */

export interface RawFolder {
    FID: number;
    FNAME: string;
    FPARENT_ID: number;
    FGUID: string;
    FCREATED_AT: Date;
    FMODIFIED_AT: Date;
}