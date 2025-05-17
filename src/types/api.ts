// {
//     "id": "5f31ccc2-8839-444d-8021-a1c5b7f1b334",
//     "createdAt": "2025-05-17T07:34:05.139537Z",
//     "updatedAt": "2025-05-17T07:34:05.152928Z",
//     "deletedAt": null,
//     "isActive": true,
//     "title": "Cứu lấy con vịt 188k",
//     "description": "Con vịt làm nhạc đầu tay",
//     "artistId": "2f13a966-2624-406a-9e7e-1dcbe1359ded",
//     "storageId": "2bf58607-ec90-42b6-b237-e12889be84d3",
//     "storageImageId": "fa5241cd-1fc2-414c-8ee8-885b0fafe80f",
//     "duration": 25,
//     "songType": "SONG"
// }
export type ApiSongType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  title: string;
  description: string;
  artistId: string;
  storageId: string;
  storageImageId: string;
  duration: number;
  songType: string;
};

// {
//     "id": 6,
//     "createdAt": "2025-05-17T12:34:42.049787Z",
//     "updatedAt": "2025-05-17T12:34:42.049787Z",
//     "deletedAt": null,
//     "isActive": true,
//     "profileID": "efd7d6cf-85a8-4e46-aacd-22608f941752",
//     "songID": "5f31ccc2-8839-444d-8021-a1c5b7f1b334"
// }
export type ApiFavoriteSongType = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  profileID: string;
  songID: string;
};

// {
//     "id": "efd7d6cf-85a8-4e46-aacd-22608f941752",
//     "createdAt": "2025-05-15T06:36:19.179188Z",
//     "updatedAt": "2025-05-15T06:36:19.179643Z",
//     "deletedAt": null,
//     "isActive": true,
//     "accountID": "2f13a966-2624-406a-9e7e-1dcbe1359ded",
//     "fullName": "Dimsum",
//     "avatarUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8WOsLxlKgTXh7gry1qONjjpnozv1IwdHf165tgttVd5FiaWx4G8yOo4LCWt9uPt6y0EWxE89oyHdEPbgre41s8Q",
//     "bio": "",
//     "dateOfBirth": "2003-01-01",
//     "phoneNumber": ""
// }
export type ApiProfileType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  accountID: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  dateOfBirth: string;
  phoneNumber: string;
};
