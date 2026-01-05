// Script/config.js

//const BASE_URL = "http://140.245.5.153:8001/api";
const BASE_URL = "http://eternal-lines.com/api/";

const API = {
  SIGNUP: `${BASE_URL}/signup/`,
  LOGIN: `${BASE_URL}/token/`,
  REFRESH: `${BASE_URL}/token/refresh/`,
  PROFILE: `${BASE_URL}/profile/`,
  SAVED_QUOTES: `${BASE_URL}/profile/saved/`,
   QUOTES_TOP5: `${BASE_URL}/quotes/top5/`,
   POPULAR_QUOTES:  `${BASE_URL}/quotes/`,
   CATEGORIES: `${BASE_URL}/categories/`,
   LANGUAGES: `${BASE_URL}/languages/`,
   SUBMIT_QUOTE: `${BASE_URL}/quotes/`,
   SAVE_QUOTE: (id) => `${BASE_URL}/quotes/${id}/save/`,
  UNSAVE_QUOTE: (id) => `${BASE_URL}/quotes/${id}/unsave/`,
  LIKE_QUOTE: (id) => `${BASE_URL}/quotes/${id}/like/`,
  UNLIKE_QUOTE: (id) => `${BASE_URL}/quotes/${id}/unlike/`,
  HOME_QUOTES_LATEST:`${BASE_URL}/homequotes/latest/`,
  HOME_QUOTES_LIKED:`${BASE_URL}/homequotes/most-liked/`,
  HOME_QUOTES_RECOMMENDED:`${BASE_URL}/homequotes/recommended/`,
  SEARCH_QUOTES: (query) => `${API_URL}?search=${encodeURIComponent(query)}`

};

window.API = API;
