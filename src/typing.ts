/*
 * @Author: jiangxin
 * @Date: 2026-05-11 14:15:49
 * @Company: orientsec.com.cn
 * @Description:
 */
export interface ICardItemType {
  key: string;
  actions?: string[];
  views?: string[];
  modifiedTime?: string;
  sceneData?: {
    title: string;
    description?: string;
    disabled?: boolean;
  };
}

export interface IAtomicItemType {
  key: string;
  name: string;
  description?: string;
}

