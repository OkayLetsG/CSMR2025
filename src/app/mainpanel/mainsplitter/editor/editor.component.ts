import { AfterViewInit, Component } from "@angular/core";
import {
  MonacoEditorModule,
  NgxMonacoEditorConfig,
} from "ngx-monaco-editor-v2";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-editor",
  standalone: true,
  imports: [MonacoEditorModule, FormsModule],
  templateUrl: "./editor.component.html",
  styleUrl: "./editor.component.css",
})
export class EditorComponent implements AfterViewInit {
  editorOptions: any;
  code: string = "";
  public ngAfterViewInit(): void {
    this.setupEditorConfig();
  }

  private setupEditorConfig(): void {
    this.editorOptions = {
      language: "json",
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontSize: 14,
      fontFamily: "monospace",
      wrappingIndent: "indent",
      lineHeight: 20,
      wordWrap: "on",
    };
    this.code = `
    [
  {
    "_id": "68780dc54fe4b3a412045439",
    "index": 0,
    "guid": "77f445d1-855e-4005-ad9f-6ac9c5a4c426",
    "isActive": false,
    "balance": "$2,222.56",
    "picture": "http://placehold.it/32x32",
    "age": 29,
    "eyeColor": "brown",
    "name": "Peggy Lowery",
    "gender": "female",
    "company": "TERRAGO",
    "email": "peggylowery@terrago.com",
    "phone": "+1 (829) 574-3269",
    "address": "601 Crosby Avenue, Bowden, Arkansas, 1147",
    "about": "Consectetur in culpa id consectetur ex nostrud. Proident do pariatur veniam cillum ex in Lorem proident. Id esse eu incididunt ex pariatur sint est nostrud minim pariatur. Sunt occaecat pariatur consequat esse.\r\n",
    "registered": "2020-04-24T01:50:10 +07:00",
    "latitude": -22.83848,
    "longitude": 46.504367,
    "tags": [
      "occaecat",
      "fugiat",
      "elit",
      "commodo",
      "cillum",
      "ipsum",
      "velit"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Woods Lawrence"
      },
      {
        "id": 1,
        "name": "Angeline Leonard"
      },
      {
        "id": 2,
        "name": "Marina Bright"
      }
    ],
    "greeting": "Hello, Peggy Lowery! You have 4 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "68780dc5b1c5647c0297f969",
    "index": 1,
    "guid": "f177c501-8437-458d-a999-beda8f212a72",
    "isActive": false,
    "balance": "$3,870.69",
    "picture": "http://placehold.it/32x32",
    "age": 25,
    "eyeColor": "brown",
    "name": "Margarita Greene",
    "gender": "female",
    "company": "ZOLAREX",
    "email": "margaritagreene@zolarex.com",
    "phone": "+1 (840) 465-3254",
    "address": "115 Stoddard Place, Boyd, Missouri, 2324",
    "about": "Reprehenderit labore proident aliqua non. Fugiat proident consequat et veniam duis laboris magna adipisicing sit. Fugiat commodo reprehenderit enim anim officia consectetur commodo veniam id do laboris cupidatat enim.\r\n",
    "registered": "2020-01-07T09:35:02 +08:00",
    "latitude": 81.755623,
    "longitude": -47.081473,
    "tags": [
      "voluptate",
      "cillum",
      "eu",
      "nulla",
      "nulla",
      "ex",
      "deserunt"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Noel Melendez"
      },
      {
        "id": 1,
        "name": "Antoinette Schultz"
      },
      {
        "id": 2,
        "name": "Arnold Head"
      }
    ],
    "greeting": "Hello, Margarita Greene! You have 1 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "68780dc502f45265b5819519",
    "index": 2,
    "guid": "e676c817-d1c0-4752-8d06-133516acf2b2",
    "isActive": true,
    "balance": "$1,577.34",
    "picture": "http://placehold.it/32x32",
    "age": 33,
    "eyeColor": "blue",
    "name": "Addie Mclean",
    "gender": "female",
    "company": "PASTURIA",
    "email": "addiemclean@pasturia.com",
    "phone": "+1 (809) 507-3188",
    "address": "997 Newport Street, Tibbie, South Carolina, 8911",
    "about": "Aliquip exercitation culpa adipisicing ut ipsum deserunt nisi. Magna aliqua ullamco esse incididunt duis sint labore laboris anim veniam eiusmod consequat. Laborum sunt ad anim tempor in. Eiusmod occaecat tempor anim enim est officia est magna incididunt do.\r\n",
    "registered": "2022-06-04T08:54:00 +07:00",
    "latitude": -53.816729,
    "longitude": 79.814352,
    "tags": [
      "in",
      "dolore",
      "elit",
      "fugiat",
      "non",
      "esse",
      "quis"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Alvarez Franco"
      },
      {
        "id": 1,
        "name": "Mendoza Morrow"
      },
      {
        "id": 2,
        "name": "Doreen Hubbard"
      }
    ],
    "greeting": "Hello, Addie Mclean! You have 3 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "68780dc567e67f878004d6e2",
    "index": 3,
    "guid": "032d5d60-65de-49ec-ae28-87710dfd22ae",
    "isActive": true,
    "balance": "$3,747.25",
    "picture": "http://placehold.it/32x32",
    "age": 24,
    "eyeColor": "brown",
    "name": "Hayes Suarez",
    "gender": "male",
    "company": "SULFAX",
    "email": "hayessuarez@sulfax.com",
    "phone": "+1 (823) 547-2015",
    "address": "293 Turnbull Avenue, Brecon, North Dakota, 8003",
    "about": "Velit fugiat voluptate Lorem ullamco fugiat deserunt do. Excepteur cillum culpa consequat laborum adipisicing. Et commodo voluptate ad sunt. Ea ut fugiat Lorem magna ut sint deserunt minim aute dolor magna nostrud laborum. Pariatur amet cupidatat laborum incididunt Lorem anim officia adipisicing sit ex quis ut esse duis. Excepteur et cillum aliquip ipsum quis ipsum commodo deserunt nostrud dolore enim eu laboris in. Consequat officia elit pariatur irure laborum in qui adipisicing.\r\n",
    "registered": "2016-06-22T05:43:22 +07:00",
    "latitude": 21.34645,
    "longitude": -3.15008,
    "tags": [
      "nulla",
      "ad",
      "sit",
      "nisi",
      "irure",
      "do",
      "eu"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Gibson Bradford"
      },
      {
        "id": 1,
        "name": "Gretchen Diaz"
      },
      {
        "id": 2,
        "name": "Baldwin Clayton"
      }
    ],
    "greeting": "Hello, Hayes Suarez! You have 3 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "68780dc5bc648d5d2bd468a2",
    "index": 4,
    "guid": "47b3cdf8-048c-4f49-bd66-d5e7a06003d5",
    "isActive": false,
    "balance": "$3,000.29",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Julie Mcmillan",
    "gender": "female",
    "company": "ENVIRE",
    "email": "juliemcmillan@envire.com",
    "phone": "+1 (822) 421-3694",
    "address": "242 Sands Street, Thynedale, Oregon, 6840",
    "about": "Officia do eu veniam laboris eu aute dolore eu aliqua esse. Velit tempor amet deserunt pariatur commodo veniam tempor voluptate non deserunt. Aliquip sint nostrud exercitation nulla.\r\n",
    "registered": "2016-08-19T09:46:57 +07:00",
    "latitude": 20.994618,
    "longitude": 105.170335,
    "tags": [
      "in",
      "mollit",
      "occaecat",
      "deserunt",
      "aliqua",
      "non",
      "quis"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Alyce Vance"
      },
      {
        "id": 1,
        "name": "Doyle Crawford"
      },
      {
        "id": 2,
        "name": "Lawanda Lopez"
      }
    ],
    "greeting": "Hello, Julie Mcmillan! You have 4 unread messages.",
    "favoriteFruit": "strawberry"
  },
  {
    "_id": "68780dc52471bfe7df82d1a5",
    "index": 5,
    "guid": "43b2dff9-9b39-40ba-bd46-d6d4f56a663d",
    "isActive": true,
    "balance": "$3,661.34",
    "picture": "http://placehold.it/32x32",
    "age": 30,
    "eyeColor": "brown",
    "name": "Thomas Lindsey",
    "gender": "male",
    "company": "YURTURE",
    "email": "thomaslindsey@yurture.com",
    "phone": "+1 (959) 510-2733",
    "address": "631 Ira Court, Joppa, Guam, 7772",
    "about": "Aliquip voluptate in incididunt nisi officia eiusmod anim tempor id officia eu anim minim ipsum. Exercitation ipsum quis veniam duis pariatur nulla adipisicing enim. Exercitation officia fugiat irure deserunt. Quis proident sint aliquip enim. Magna sit ea est sunt anim eiusmod elit. Amet enim dolor officia ullamco exercitation esse duis esse non est.\r\n",
    "registered": "2022-01-27T09:02:44 +08:00",
    "latitude": 5.834477,
    "longitude": 95.116066,
    "tags": [
      "veniam",
      "magna",
      "cupidatat",
      "id",
      "cupidatat",
      "qui",
      "ad"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Patti Levine"
      },
      {
        "id": 1,
        "name": "Carey Williamson"
      },
      {
        "id": 2,
        "name": "Huff Gordon"
      }
    ],
    "greeting": "Hello, Thomas Lindsey! You have 3 unread messages.",
    "favoriteFruit": "strawberry"
  }
]
    `;
  }
}
