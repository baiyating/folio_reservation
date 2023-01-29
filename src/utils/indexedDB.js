
let db;

const request = window.indexedDB.open('localforage', 2);

request.onerror = function (event) {
  console.log('数据库打开报错');
};
request.onupgradeneeded = function (event) {
  db = event.target.result;
  console.log('数据库onupgradeneeded');
  if (!db.objectStoreNames.contains('localforage')) {
    this.store = db.createObjectStore('localforage', { keyPath: 'key' });
  }
};
request.onsuccess = function (event) {
  db = request.result;
  console.log('数据库打开成功');
};

function read() {
  const transaction = db.transaction(['keyvaluepairs']);
  const objectStore = transaction.objectStore('keyvaluepairs');
  const req = objectStore.get('okapiSess');

  req.onerror = function (event) {
    console.log('事务失败');
  };

  req.onsuccess = function (event) {
    if (req.result) {
      console.log(req.result);
      console.log('token: ', req.result.token);
      console.log('user: ', req.result.user);
      console.log('perms: ', req.result.perms);
    } else {
      console.log('未获得数据记录');
    }
  };
}
read();
