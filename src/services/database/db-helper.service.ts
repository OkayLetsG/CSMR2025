import { Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";

@Injectable({
  providedIn: "root",
})

/**
 * @class DbHelperService
 *
 * A base class to provide helper methods to interact with the database
 */
export class DbHelperService {
  /**
   * @property {Database} db
   *
   * It is used to access the database
   */
  db: any;

  constructor() {
    this.initializeDB();
  }

  /**
   * @method initializeDB
   *
   * It is used to initialize the database connection
   */
  public async initializeDB(): Promise<void> {
    try {
      const dbConnection = await Database.load(
        "sqlite:csmremasterd2025_database.db"
      );
      if (dbConnection) {
        this.db = dbConnection;
        console.log("Database connected");
      } else {
        console.log("Database not connected");
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   *
   * @method executeQuery
   * @param query
   * @returns Selected data
   *
   * A helper method to execute queries to select data on the database
   */
  public async executeQuery<T>(query: string): Promise<T[]> {
    try {
      const result = await this.db.select(query);
      return result as T[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
