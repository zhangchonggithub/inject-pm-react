//------------------------------------------------------------------
//title: 注入工具
//author: zc
//date:
//desc:当前值添加全局单例模式注入 动态对象直接走 new
//------------------------------------------------------------------

export default class Inject {
  constructor() {
    this._classMap = new Map();
  }
  
  /**
   * 获得注入的class
   */
  static getClass(value, ...props) {
    const _this = Inject.getInstance();
    const path = _this.getInjectPath(value) ;
    if (_this._classMap.has(path)) {
      let _re = _this._classMap.get(path);
      if (_re._constructor && props.length > 0)
        _re._constructor(...props);
      return _re;
    }
    let _nc = new value(...props);
    _this._classMap.set(path, _nc);
    return _nc;
  }
  
  /**
   *  简单做个唯一标识
   * @param value
   * @returns {string}
   */
   getInjectPath(value) {
    if (value.prototype.__class)
      return value.prototype.__class;
    value.prototype.__class = `${value.name}.class.${new Date().getTime()}.${parseInt(Math.random()*1000)}.${Inject.createOID()}`;
    return value.prototype.__class;
  }
  
  /**
   * 删除class
   */
  static removeClass(value) {
    if (!value.prototype.hasOwnProperty("__class"))
      return null ;
    const _this = Inject.getInstance() ;
    if (_this._classMap.has(value.prototype.__class))
      return _this._classMap.delete(value);
    return null ;
  }
  
  static getInstance() {
    if (!Inject._instance)
      Inject._instance = new Inject();
    return Inject._instance;
  }
    
    
    /**
     * 产生对象级唯一ID 提高性能
     */
    static createOID(key) {
        if (!Inject.objRandom)
            Inject.__setRandomNum(0);
        Inject.objRandom.st += 1;
        if (Inject.objRandom.st >= 999999999999998)
            Inject.__setRandomNum(0);
        return `${key}${Inject.objRandom.start}${Inject.objRandom.start1}${Inject.objRandom.st}`;
    }
    
    /**
     *
     * @param st
     * @private
     */
    static __setRandomNum(st){
        if (!Inject.objRandom)
            Inject.objRandom = {};
        Inject.objRandom.st = st ;
        Inject.objRandom.start = parseInt(Math.random()*1000) ;
        Inject.objRandom.start1 = Inject.Inject(8,99999999999) ;
    }
    
}
