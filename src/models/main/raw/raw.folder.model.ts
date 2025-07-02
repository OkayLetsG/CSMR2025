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
    LKEY: string;
    LNAME: string;
    FLID: number;
    FGUID: string;
    FPIN: number;
    FCREATED_AT: Date;
    FMODIFIED_AT: Date;
}