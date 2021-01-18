// Vendor
const requestPromise = require('request-promise');

// Services
const {fetchStashTabs} = require('./stash-tabs');

// Constants
const BASE_URL = 'https://www.pathofexile.com/character-window/get-stash-items';
const RARE_FRAME_TYPE = 2;

const getTypeFrom = ({icon}) => {
  if (/\/BodyArmours\//.test(icon)) return 'bodyArmour';
  if (/\/Helmets\//.test(icon)) return 'helmet';
  if (/\/Gloves\//.test(icon)) return 'glove';
  if (/\/Boots\//.test(icon)) return 'boot';
  if (/\/Belts\//.test(icon)) return 'belt';
  if (/\/Amulets\//.test(icon)) return 'amulet';
  if (/\/Rings\//.test(icon)) return 'ring';
  if (/\/OneHandWeapons\//.test(icon)) return 'oneHand';
  if (/\/TwoHandWeapons\//.test(icon)) return 'twoHand';

  return null;
};

const fetchFromStashIndex = async (stashIndex, {account, league, sessionId}) => {
  const rawResponse = await requestPromise({
    uri: encodeURI(`${BASE_URL}?accountName=${account}&league=${league}&tabIndex=${stashIndex}`),
    headers: {
      'User-Agent': `Chaos Recipe Overlay/v1.1.0`,
      Cookie: `POESESSID=${sessionId}`
    }
  });

  const {items: rawItems} = JSON.parse(rawResponse);

  return rawItems.map(rawItem => ({
      itemLevel: rawItem.ilvl,
      type: getTypeFrom(rawItem),
      identified: rawItem.identified,
      isRare: rawItem.frameType === RARE_FRAME_TYPE
  }));
};

exports.fetchStashItems = async (stashIds, {account, league, sessionId}) => {
  if (!stashIds.length) return [];

  const stashTabs = await fetchStashTabs({league, account, sessionId});

  const stashIndexes = stashTabs.filter(stashTab => stashIds.includes(stashTab.id)).map(stashTab => stashTab.index);

  let stashItems = [];
  while (stashIndexes.length) {
    const newStashItems = await fetchFromStashIndex(stashIndexes.shift(), {account, league, sessionId});
    stashItems = stashItems.concat(newStashItems);
  }

  return stashItems;
};
