// {
//     "id": "9d8c3af2-f9c3-4fde-a6e5-b5098f28223c",
//     "songUrl": "https://clontify-storage.s3.amazonaws.com/audios/358236eb-92f1-43e8-8f86-f787f0fea3a4.mp3?response-content-disposition=inline&response-content-type=audio%2Fmpeg&AWSAccessKeyId=AKIA4Y5DFSU7Y2AKHSWS&Signature=fOIi7BFfdsqc9cpbmI%2Be7PsL1Mo%3D&Expires=1747588387",
//     "backgroundUrl": "https://clontify-storage.s3.amazonaws.com/images/55a12c88-7a34-4002-af53-696d95e7cdf0.jpg?response-content-disposition=inline&response-content-type=image%2Fjpeg&AWSAccessKeyId=AKIA4Y5DFSU7Y2AKHSWS&Signature=N5QJHVUQOeyqaqJibo4iiaEtBNE%3D&Expires=1747588388",
//     "createdAt": "2025-05-17T07:46:09.551779Z",
//     "updatedAt": "2025-05-17T07:46:09.562471Z",
//     "deletedAt": null,
//     "isActive": true,
//     "title": "cứu lấy âm nhạc",
//     "description": "Con vịt làm nhạc đầu tay",
//     "artistId": "9d8c3af2-f9c3-4fde-a6e5-b5098f28222b",
//     "duration": 25,
//     "songType": "SONG"
// }
export type ApiSongType = {
  id: string;
  songUrl: string;
  backgroundUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  title: string;
  description: string;
  artistId: string;
  duration: number;
  songType: string;
};

// {
//     "id": 1,
//     "createdAt": "2025-05-17T17:21:42.788083Z",
//     "updatedAt": "2025-05-17T17:21:42.788083Z",
//     "deletedAt": null,
//     "isActive": true,
//     "profileID": "d801ba03-323b-438c-8887-47bf33c8cc07",
//     "songID": "9d8c3af2-f9c3-4fde-a6e5-b5098f28223c"
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