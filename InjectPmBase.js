/**
 * title:
 * desc:基础视图控制模型 集成 基本的查询逻辑
 * auth:zc
 * date:
 */
import Inject from "./Inject";


export default class InjectPmBase {
  constructor(owner = null) {
    this._constructor(owner);
    this.connectList = null ;
    this.connectOwners = null ;
    this.state = {} ;
  }

  //等闲点 必须重写 松耦合的方式  或是直接用vue 不用react
  _constructor(target = null) {
    
    //初始化
    this._initState() ;
    //目标
    this._targetPM = null ;
    if(Array.isArray(target)){
      this.register(target) ;
      return ;
    }
    
    let owner = target ;
    if(target instanceof InjectPmBase){
      this._targetPM = target ;
      owner = target.owner ;
    }
    this.owner = owner;
    const st = this.state;
    if (owner){
      if(owner.state){
        this.state = owner.state;
        Object.assign(this.state, st);
      }
      owner.state = this.state;
    }
  }
  
  _initState(){
    if (!this.state)
      this.state = {};
    if (!this.state.hasOwnProperty("isLoading"))
      this.state.isLoading = false;
    if (!this.state.hasOwnProperty("queryLoading"))
      this.state.queryLoading = false;
  }

  /**
   *
   * @param obj
   */
  initData(obj) {
    Object.assign(this.state, obj);
    if(this.owner && this.owner.state)
      Object.assign(this.owner.state, obj);
    if(this._targetPM){
      Object.assign(this._targetPM.state, obj);
      if(this._targetPM.owner)
        Object.assign(this._targetPM.owner.state, obj);
    }
  }

  /**
   * @param value
   */
  setState( value ) {
    if(this._targetPM){
      Object.assign(this.state,value);
      Object.assign(this.owner.state,value);
      this._targetPM.setState(value) ;
    }
    else{
      //设置状态值
      this.setOwnerState(this.owner,value ) ;
    }
    if(this.connectList)
      this.handlerState(value);
  }
  
  /**
   *  设置状态值
   */
  setOwnerState( owner , value){
    if(value)
      Object.assign(this.state, value);
    
    if(!owner)
      return ;
    
    if(owner.use){
      owner.state = this.state = {...this.state} ;
      owner.setState(owner.state);
    }
    else
      owner.setState(value);
  }

  /**
   * 设置连接数据
   * @param data
   */
  setConnectData( data ){
    this.setState(data ) ;
  }

  /**
   * 还要维护一个更新列表  react 数据驱动还要依赖组件 很蹩脚的设计
   * @param owner
   * @param states
   */
  connect(owner,states,render=false){
    if(Array.isArray(owner)){
      const useOwner = this.getUseConnect(owner) ;
      if(useOwner)
        return [useOwner.o.state,this,owner[1] ] ;
      owner = this.getHookOwner(owner) ;
    }
    
    let con = {id:"",isNull:false,o:owner,st:states } ;
    if(!owner.state)
      owner.state = {} ;
    
    if(!this.connectList){
      this.connectOwners = [] ;
      this.connectList = {} ;
    }
    
    this.connectOwners.push(con) ;
    for(let att of states ){
      if(!this.connectList.hasOwnProperty(att))
        this.connectList[att] = [] ;
      this.connectList[att].push(con) ;
    }
    this.handlerItemState(con,render) ;
    return owner.use?[owner.state,this,owner.setState]:this ;
  }
  
  /**
   *  是否存在
   * @param arr  temp??????????
   * @returns {boolean}
   */
  getUseConnect( arr ){
    if(!this.connectOwners || this.connectOwners.length===0)
      return null ;
    const setState = arr[1] ;
    for(let item of this.connectOwners){
      if(item.o.setState === setState)
        return item ;
    }
    return null ;
  }
  
  /**
   *
   * @param arr
   * @returns {{use: boolean, state: *, setState: *}}
   */
  getHookOwner( arr ){
    return{
      use:true,
      state:arr[0]||{},
      setState:arr[1],
    };
  }

  /**
   *
   * @param value
   */
  handlerState( value ){
    let rid = Inject.createOID("state_r") ;
    for(let att in value ){
      if( !this.connectList.hasOwnProperty(att))
        continue;
      for(let item of this.connectList[att]){
        if(item.isNull===false && item.id !==rid){
          this.handlerItemState(item) ;
          item.id = rid ;
        }
      }
    }
  }

  /**
   * 处理更新
   * @param item
   */
  handlerItemState(item,render=true){
    if(!item.obj)
      item.obj = {} ;
    for(let att of item.st){
      if(this.state.hasOwnProperty(att))
         item.obj[att] = this.state[att];
    }
    if(item.o.setConnectData)
      item.o.setConnectData(item.obj,render) ;
    else{
      Object.assign(item.o.state,item.obj) ;
      if(render){
        if(item.o.use){
          item.o.state = {...item.o.state};
          item.o.setState(item.o.state) ;
        }
        else
          item.o.setState(item.obj) ;
      }
    }
  }
  
  /**
   * 注册 hook 组件
   * @param arr
   * @returns {*}
   */
  register( arr ){
    if(this.owner && this.owner.setState === arr[1])
      return this.owner.link ;
  
    const re = [this.state,this,arr[1],this.owner] ;
    if(!this.owner)
      this.owner = {} ;
    Object.assign(this.owner,{link:re,use:true,state:this.state,setState:arr[1] });
    
    if(arr[0])
      Object.assign(this.state,arr[0]) ;
    return re ;
  }
  
  /**
   * 释放 不销毁
   */
  release(destory=false){
    if(this.owner)
      this.owner = null ;
  }
  
  /**
   * 释放状态器
   * @param setFunc
   * @returns {function(): Function}
   */
  unConnect(setState){
    return ()=>{
      return ()=>{
        this.disConnect(setState);
      }
    };
  }

  /**
   * 解绑
   * @param owner
   */
  disConnect(owner){
    if(!this.connectOwners)
      return ;

    let len = this.connectOwners.length ;
    for(let i=0;i<len;i++){
      const item = this.connectOwners[i] ;
      if(item.o === owner || (item.o && item.o.setState ===owner)){
        this.removeAttItem(item) ;
        item.o = null ;
        item.st = null ;
        item.isNull = true ;
      }
      this.connectOwners.splice(i,1) ;
      i-=1;
      len-=1;
    }
  }
  
  /**
   * 删除关联对象
   * @param item
   */
  removeAttItem(item){
    if(!item.st || !Array.isArray(item.st) || !this.connectList)
      return ;
    
    for(let att of item.st){
      if(this.connectList.hasOwnProperty(att)){
        const arr = this.connectList[att] ;
        if(arr){
          const index = arr.indexOf(item) ;
          if(index>-1)
            arr.splice(index,1) ;
        }
        if(arr.length===0)
          delete this.connectList[att] ;
      }
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this._targetPM = null ;
    this.owner = null;
    this.connectList = null ;
    this.connectOwners = null ;
    this.props = null ;
    if(this.mainPM)
      this.mainPM = null ;
  }
  
}
