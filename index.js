/**
 * title:
 * desc:描述
 * auth:zc
 * date:
 */
import Inject from "./Inject";
import InjectPmBase from "./InjectPmBase";

/**
 *  通过注入类作为状态容器 获得 state
 * @param pmClass 控制类
 * @param useState 状态器
 * @returns {*}
 */
const useHookState = ( pmClass , useState)=> {
   const viewPM = Inject.getClass(pmClass,useState);
   return [viewPM.state,viewPM,useState[1]] ;
};

/**
 *
 * @param pmClass
 * @param useState
 * @param connect
 */
const useHookConnect = ( pmClass , useState ,connect )=>{
  const viewPM = Inject.getClass(pmClass);
  return viewPM.connect(useState,connect) ;
};

/**
 *
 * @param pmClass
 * @param useState
 * @param connect
 */
const usePmState = ( pmClass )=>{
  const viewPM =  Inject.getClass(pmClass) ;
  return [viewPM.state,viewPM] ;
};

export  {useHookConnect,useHookState,usePmState,Inject,InjectPmBase} ;
