import { pathToRegexp } from 'path-to-regexp';
import { urlToList } from '@/components/_utils/pathTools';
import { isUrl } from '../utils/utils';

let menuDataCache;
let flatMenuKeys;
export const redirectData = [];

/**
 * 根据菜单取得重定向地址.
 */
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => [path,path2]
 * @param  menu
 */
export const getFlatMenuKeys = menu => {
  if (flatMenuKeys) return flatMenuKeys;
  return menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);
};

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = pathname => {
  const paths = urlToList(pathname);
  return paths.reduce((matchKeys, path) => matchKeys.concat(flatMenuKeys.filter(item => pathToRegexp(item).test(path))), []);
};

// 扁平化menudata,需要加入component判断有没有link
function getFlatMenuDataForBreadcrumb(menus, routerData) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item, component: routerData[item.path] };
      keys = { ...keys, ...getFlatMenuDataForBreadcrumb(item.children, routerData) };
    } else {
      keys[item.path] = { ...item, component: routerData[item.path] };
    }
  });
  return keys;
}

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
export const getBreadcrumbNameMap = (menuData, routerData) => {
  const data = getFlatMenuDataForBreadcrumb(menuData, routerData);
  return { ...routerData, ...data };
};

// 格式化menu结构输,补全子menu的url和权限,顺便把menulevel放进去
// list 上一级example=>/example/list
function menuFormatter(data, parentPath = '/', parentAuthority, menuLevel = 1) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
      menuLevel,
    };
    if (item.children) {
      result.children = menuFormatter(item.children, `${parentPath}${item.path}/`, item.authority, menuLevel + 1);
    }
    return result;
  });
}

// 显式传入就重新设置menuData,防止重新登陆的权限没刷新
export const getMenuData = menuData => {
  if (menuDataCache && !menuData) {
    return menuDataCache;
  }
  if (Array.isArray(menuData) && menuData.length > 0) {
    menuDataCache = menuFormatter(menuData);
    flatMenuKeys = getFlatMenuKeys(menuDataCache);
    // 获取菜单重定向
    menuDataCache.forEach(getRedirect);
    return menuDataCache;
  } else {
    return [];
  }
};

/**
 * 菜单后端实际结构示例
 */
export const menuData = [
  {
    name: '房子',
    icon: 'icon-ziyuan',
    path: 'house',
  },
  {
    name: '小区',
    icon: 'icon-tixing',
    path: 'building',
  },
  {
    name: '学校',
    icon: 'icon-wangye',
    path: 'school',
  },
  {
    name: '样例',
    icon: 'icon-shezhi',
    path: 'example',
    children: [
      {
        name: '展板',
        path: 'dashboard',
      },
      {
        name: '表单',
        path: 'form',
      },
      {
        name: '错误边界',
        path: 'errorBoundary',
      },
      {
        name: '动画',
        path: 'cssanimate',
      },
      {
        name: '富文本',
        path: 'editor',
      },
      {
        name: '列表hook版',
        path: 'listHook',
      },
      {
        name: '用户列表',
        path: 'user',
      },
      {
        name: '列表',
        path: 'list',
        // hideInBreadcrumb: true, // 是否隐藏面包屑
        // hideInMenu: true, // 是否在菜单中隐藏
        // authority:[""], //什么角色可以看
      },
    ],
  },
];
