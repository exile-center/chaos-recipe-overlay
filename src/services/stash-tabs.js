// Vendor
const requestPromise = require('request-promise');

// Constants
const BASE_URL = 'https://www.pathofexile.com/character-window/get-stash-items';
const VALID_TYPES = ['PremiumStash', 'QuadStash'];

exports.fetchStashTabs = async ({account, league, sessionId}) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${BASE_URL}?accountName=${account}&league=${league}&tabs=1`),
    headers: {
      'User-Agent': `Chaos Recipe Overlay/v1.1.0`,
      Cookie: `POESESSID=${sessionId}`
    }
  });

  const {tabs} = JSON.parse(rawResponse);

  return tabs.map(tab => ({
    id: tab.id,
    index: tab.i,
    name: tab.n,
    colorCss: `rgb(${tab.colour.r}, ${tab.colour.g}, ${tab.colour.b})`,
    isValid: VALID_TYPES.includes(tab.type)
  }));
};
