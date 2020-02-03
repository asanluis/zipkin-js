const cls = require('continuation-local-storage');
const clsHooked = require('cls-hooked');

module.exports = class CLSContext {
  constructor(namespace = 'zipkin', supportAsyncAwait = false) {
    if (supportAsyncAwait) {
      this._session = clsHooked.getNamespace(namespace) || clsHooked.createNamespace(namespace);
    } else {
      this._session = cls.getNamespace(namespace) || cls.createNamespace(namespace);
    }
    const defaultContext = this._session.createContext();
    this._session.enter(defaultContext);
  }

  setContext(ctx) {
    this._session.set('zipkin', ctx);
  }

  getContext() {
    const currentCtx = this._session.get('zipkin');
    if (currentCtx != null) {
      return currentCtx;
    } else {
      return null; // explicitly return null (not undefined)
    }
  }

  scoped(callable) {
    let result;
    this._session.run(() => {
      result = callable();
    });
    return result;
  }

  letContext(ctx, callable) {
    return this.scoped(() => {
      this.setContext(ctx);
      return callable();
    });
  }
};
