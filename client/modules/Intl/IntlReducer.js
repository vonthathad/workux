import { enabledLanguages, localizationData, channel } from '../../../Intl/setup';
import { SWITCH_LANGUAGE } from './IntlActions';

const initLocale = channel;

const initialState = {
  locale: initLocale,
  enabledLanguages,
  ...(localizationData[initLocale] || {}),
};

const IntlReducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_LANGUAGE: {
      const { type, ...actionWithoutType } = action; // eslint-disable-line
      return { ...state, ...actionWithoutType };
    }

    default:
      return state;
  }
};
export const analyticChannel = initialState.messages.analyticChannel;
export const getAdsChannels = state => {
  const adsChannels = {
    start: state.intl.messages.adsChannel1,
    end: state.intl.messages.adsChannel2,
  };
  return adsChannels;
};
export default IntlReducer;
