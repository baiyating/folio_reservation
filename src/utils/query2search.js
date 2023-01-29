export const queryObj2Search = query => {
  const search = query
    ? ['?']
      .concat(Object.keys(query))
      .reduce(
        (a, b) => a +
            (query[b] === null || query[b] === undefined || query[b] === ''
              ? ''
              : b + '=' + query[b] + '&')
      )
      .slice(0, -1)
    : '';
  return search;
};

const query2search = location => {
  return {
    ...location,
    search: queryObj2Search(location.search),
  };
};

export const search2query = search => {
  const query = {};
  if (search && search.length > 1) {
    search
      .slice(1)
      .split('&')
      .forEach(item => {
        const [key, ...values] = item.split('=');
        query[key] = decodeURI(values.join('=')) || true;
      });
  }
  return query;
};

export const query2href = location => {
  const { pathname, search } = query2search(location);
  return pathname + search;
};
export const filter2Obj = (filters) => {
  // let filtersObj = {};
  // if (filters) {
  //   const obj = {};
  //   try {
  //     filters.split(';').forEach(item => {
  //       const [k, v] = item.split('=');
  //       if (obj[k]) {
  //         obj[k].push(...v.split(','));
  //       } else {
  //         obj[k] = [...v.split(',')];
  //       }
  //     });
  //     filtersObj = obj;
  //   } catch (e) {
  //     return filtersObj;
  //   }
  // }
  const searchValue = {};

  if (filters) {
    filters.split(';').forEach((item) => {
      const [k, v] = item.split('=');

      if (v.includes(',')) {
        searchValue[k] = v.split(',');
      } else if (v.includes(' ~ ')) {
        console.log(v.split(' ~ '));
        searchValue[k] = v.split(' ~ ');
      } else {
        searchValue[k] = [v];
      }
    });
  }
  return searchValue;
};

export default query2search;
