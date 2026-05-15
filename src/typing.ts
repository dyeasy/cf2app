/*
 * @Author: jiangxin
 * @Date: 2026-05-11 14:15:49
 * @Company: orientsec.com.cn
 * @Description: 
 */
export interface ICardItemType {
  key: string;
  actions: string[];
  views: string[];
  sceneData: {
    title: string;
    description?: string;
  };
}
