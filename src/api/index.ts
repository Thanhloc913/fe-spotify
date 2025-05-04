// Export all APIs from a single entry point
import api from './api';
import { mockApi } from './mockApi';
import * as artistsApi from './artists';
import * as albumsApi from './albums';
import * as tracksApi from './tracks';
import musicApi from './musicApi';

// Export all APIs
export {
  api as default,
  mockApi,
  artistsApi,
  albumsApi,
  tracksApi,
  musicApi
};

// Re-export the mock data for convenience
export { mockData } from '../mock/data'; 