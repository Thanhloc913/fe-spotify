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
  songType: "MUSIC_VIDEO" | "SONG";
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

export type ApiPaginatedResult<T> = {
  result: T[];
  currentPage: number;
  total: number;
  totalPages: number;
};

// {
//   "id": "c83fd36f-c138-44b6-9233-5b9240443f63",
//   "createdAt": "2025-05-16T03:11:32.699945Z",
//   "updatedAt": "2025-05-18T04:20:41.747126Z",
//   "deletedAt": null,
//   "isActive": true,
//   "name": "ARTIST",
//   "description": "Artist role for music creators123"
// }
export type ApiRoleType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  name: string;
  description: string;
};

export type ApiPagedRequest = {
  page: number;
  pageSize: number;
};

export type ApiGetRoleRequest = ApiPagedRequest & {
  name?: string;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type ApiCreateRoleRequest = {
  name: string;
  description: string;
};

export type ApiEditRoleRequest = {
  id: string;
  name: string;
  description: string;
};

export type ApiDeleteRolesRequest = {
  ids: string[];
};

// storage upload
export type ApiStorageUploadResponse = {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
};

// storage create
export type ApiStorageCreateRequest = {
  fileName: string;
  fileType: string;
  userId: string;
  fileUrl: string;
  fileSize: number;
  description: string;
};

export type ApiStorageCreateResponse = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string;
};

// album create
export type ApiAlbumCreateRequest = {
  name: string;
  description: string;
  storageImageId: string;
  artistId: string;
};

export type ApiAlbumType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  name: string;
  description: string;
  storageImageId: string;
  artistId: string;
};

// storage upload req
// fetch("http://localhost:8083/storage/upload", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3NTQ2MzkxLCJpYXQiOjE3NDc1NDQ1OTEsImp0aSI6ImU2NWI3ZDdjZTEzZjQ2MTJiY2Y0ZDg3MzFjNTAxZmY2IiwidXNlcl9pZCI6IjAwYzBkNDlmLTI5ZDQtNGZhMy1iYzQxLWU1ODc5Yzk1NWJiNSJ9.nEqJVDiZWnGrakv5OAfkyl7ynysiUFQcatmjOAsvXYk",
//     "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryyQnDTMqP4CAmpkYW",
//     "sec-ch-ua": "\"Chromium\";v=\"136\", \"Microsoft Edge\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//     "x-csrftoken": "8Ke4lNrL58mct1bRjrfmFoc3swyy1tmi"
//   },
//   "referrer": "http://localhost:5173/",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": "------WebKitFormBoundaryyQnDTMqP4CAmpkYW\r\nContent-Disposition: form-data; name=\"file\"; filename=\"Disc 6 Matrix.png\"\r\nContent-Type: image/png\r\n\r\n\r\n------WebKitFormBoundaryyQnDTMqP4CAmpkYW--\r\n",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "include"
// });
// (binary)

// storage upload res
// {
//     "success": true,
//     "message": "Upload thành công",
//     "data": {
//         "fileName": "images/81b34f8e-67b0-4dbd-83f3-59eeac85ef35.png",
//         "fileType": "image",
//         "fileSize": 459105,
//         "fileUrl": "images/81b34f8e-67b0-4dbd-83f3-59eeac85ef35.png"
//     }
// }

// storage create req
// fetch("http://localhost:8083/storage/create", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3NTQ2MzkxLCJpYXQiOjE3NDc1NDQ1OTEsImp0aSI6ImU2NWI3ZDdjZTEzZjQ2MTJiY2Y0ZDg3MzFjNTAxZmY2IiwidXNlcl9pZCI6IjAwYzBkNDlmLTI5ZDQtNGZhMy1iYzQxLWU1ODc5Yzk1NWJiNSJ9.nEqJVDiZWnGrakv5OAfkyl7ynysiUFQcatmjOAsvXYk",
//     "content-type": "application/json",
//     "sec-ch-ua": "\"Chromium\";v=\"136\", \"Microsoft Edge\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//     "x-csrftoken": "8Ke4lNrL58mct1bRjrfmFoc3swyy1tmi"
//   },
//   "referrer": "http://localhost:5173/",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": "{\"fileName\":\"images/c8da1150-6767-4443-82ae-ab9506e22c91.png\",\"fileType\":\"image\",\"userId\":\"d801ba03-323b-438c-8887-47bf33c8cc07\",\"fileUrl\":\"images/c8da1150-6767-4443-82ae-ab9506e22c91.png\",\"fileSize\":449069,\"description\":\"Album cover image\"}",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "include"
// });
// {
//     "fileName": "images/c8da1150-6767-4443-82ae-ab9506e22c91.png",
//     "fileType": "image",
//     "userId": "d801ba03-323b-438c-8887-47bf33c8cc07",
//     "fileUrl": "images/c8da1150-6767-4443-82ae-ab9506e22c91.png",
//     "fileSize": 449069,
//     "description": "Album cover image"
// }

// storage create res
// {
//     "success": true,
//     "message": "Thành công",
//     "data": {
//         "id": "1e4a5aa2-60e0-4d9b-b7de-3b3934c81cb7",
//         "createdAt": "2025-05-18T05:19:32.494506Z",
//         "updatedAt": "2025-05-18T05:19:32.502991Z",
//         "deletedAt": null,
//         "isActive": true,
//         "userId": "d801ba03-323b-438c-8887-47bf33c8cc07",
//         "fileName": "images/c8da1150-6767-4443-82ae-ab9506e22c91.png",
//         "fileType": "image",
//         "fileSize": 449069,
//         "fileUrl": "images/c8da1150-6767-4443-82ae-ab9506e22c91.png",
//         "description": "Album cover image"
//     }
// }

// album create req
// fetch("http://localhost:8082/album/create", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3NTQ2MzkxLCJpYXQiOjE3NDc1NDQ1OTEsImp0aSI6ImU2NWI3ZDdjZTEzZjQ2MTJiY2Y0ZDg3MzFjNTAxZmY2IiwidXNlcl9pZCI6IjAwYzBkNDlmLTI5ZDQtNGZhMy1iYzQxLWU1ODc5Yzk1NWJiNSJ9.nEqJVDiZWnGrakv5OAfkyl7ynysiUFQcatmjOAsvXYk",
//     "content-type": "application/json",
//     "sec-ch-ua": "\"Chromium\";v=\"136\", \"Microsoft Edge\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//     "x-csrftoken": "8Ke4lNrL58mct1bRjrfmFoc3swyy1tmi"
//   },
//   "referrer": "http://localhost:5173/",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": "{\"name\":\"windows title bar\",\"description\":\"thiet ke giao dien\",\"storageImageId\":\"1e4a5aa2-60e0-4d9b-b7de-3b3934c81cb7\",\"artistId\":\"d801ba03-323b-438c-8887-47bf33c8cc07\"}",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "include"
// });
// {
//     "name": "windows title bar",
//     "description": "thiet ke giao dien",
//     "storageImageId": "1e4a5aa2-60e0-4d9b-b7de-3b3934c81cb7",
//     "artistId": "d801ba03-323b-438c-8887-47bf33c8cc07"
// }

// album create response
// {
//     "success": true,
//     "message": "Thành công",
//     "data": {
//         "id": "85c74eb3-f5b2-4364-a2e2-fa6b6c7acd6e",
//         "createdAt": "2025-05-18T05:19:32.627906Z",
//         "updatedAt": "2025-05-18T05:19:32.636810Z",
//         "deletedAt": null,
//         "isActive": true,
//         "name": "windows title bar",
//         "description": "thiet ke giao dien",
//         "storageImageId": "1e4a5aa2-60e0-4d9b-b7de-3b3934c81cb7",
//         "artistId": "d801ba03-323b-438c-8887-47bf33c8cc07"
//     }
// }

// song create
export type ApiSongCreateRequest = {
  title: string;
  artistId: string;
  genreId: string[];
  storageId: string;
  storageImageId: string | null;
  duration: number;
  description: string;
  albumId: string[];
  songType: "MUSIC_VIDEO" | "SONG";
};

export type ApiSongUpdateRequest = {
  id: string; // UUID of the song to update
  title: string;
  storageImageId: string | null; // UUID of the associated image
  duration: number; // Duration in seconds
  description: string;
  songType: "MUSIC_VIDEO" | "SONG"; // Extend as needed
};

export type ApiDeleteSongsRequest = {
  ids: string[];
};

export type ApiGenreType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isActive: boolean;
  name: string;
  description: string;
};

export type ApiGetGenreRequest = ApiPagedRequest & {
  name?: string;
};

export type ApiCreateGenreRequest = {
  name: string;
  description: string;
};

export type ApiEditGenreRequest = {
  id: string;
  name: string;
  description: string;
};

export type ApiDeleteGenresRequest = {
  ids: string[];
};
