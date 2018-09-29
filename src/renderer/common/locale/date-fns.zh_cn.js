import buildFormatLocale from 'date-fns/locale/zh_cn/build_format_locale/index.js';

const buildDistanceInWordsLocale = () => {
  const distanceInWordsLocale = {
    lessThanXSeconds: {
      one: '1秒',
      other: '{{count}}秒',
    },

    xSeconds: {
      one: '1秒',
      other: '{{count}}秒',
    },

    halfAMinute: '半分钟',

    lessThanXMinutes: {
      one: '1分钟',
      other: '{{count}}分钟',
    },

    xMinutes: {
      one: '1分钟',
      other: '{{count}}分钟',
    },

    xHours: {
      one: '1小时',
      other: '{{count}}小时',
    },

    aboutXHours: {
      one: '1小时',
      other: '{{count}}小时',
    },

    xDays: {
      one: '1天',
      other: '{{count}}天',
    },

    aboutXMonths: {
      one: '1个月',
      other: '{{count}}个月',
    },

    xMonths: {
      one: '1个月',
      other: '{{count}}个月',
    },

    aboutXYears: {
      one: '1年',
      other: '{{count}}年',
    },

    xYears: {
      one: '1年',
      other: '{{count}}年',
    },

    overXYears: {
      one: '1年',
      other: '{{count}}年',
    },

    almostXYears: {
      one: '1年',
      other: '{{count}}年',
    },
  };

  function localize(token, count, options) {
    options = options || {};

    let result;
    if (typeof distanceInWordsLocale[token] === 'string') {
      result = distanceInWordsLocale[token];
    } else if (count === 1) {
      result = distanceInWordsLocale[token].one;
    } else {
      result = distanceInWordsLocale[token].other.replace('{{count}}', count);
    }

    if (options.addSuffix) {
      if (options.comparison > 0) {
        return `${result}内`;
      }
      return `${result}前`;
    }

    return result;
  }

  return { localize };
};

export default {
  format: buildFormatLocale(),
  distanceInWords: buildDistanceInWordsLocale(),
};
