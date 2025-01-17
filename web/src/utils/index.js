import { h, unref } from "vue";
import { NIcon, NTag, NTooltip, NTime } from "naive-ui";
import { cloneDeep } from "lodash-es";
/**
 * render 图标
 * */
export function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/**
 * render new Tag
 * */
const newTagColors = { color: "#f90", textColor: "#fff", borderColor: "#f90" };
export function renderNew(
  type = "warning",
  text = "New",
  color = newTagColors
) {
  return () =>
    h(
      NTag,
      {
        type,
        round: true,
        size: "small",
        color,
      },
      { default: () => text }
    );
}

/**
 * 递归组装菜单格式
 */
export function generatorMenu(routerMap) {
  return filterRouter(routerMap).map((item) => {
    const isRoot = isRootRouter(item);
    const info = isRoot ? item.children[0] : item;
    const currentMenu = {
      ...info,
      ...info.meta,
      label: info.meta?.title,
      key: info.name,
      icon: isRoot ? item.meta?.icon : info.meta?.icon,
    };
    // 是否有子菜单，并递归处理
    if (info.children && info.children.length > 0) {
      // Recursion
      currentMenu.children = generatorMenu(info.children);
    }
    return currentMenu;
  });
}

/**
 * 混合菜单
 * */
export function generatorMenuMix(routerMap, routerName, location) {
  const cloneRouterMap = cloneDeep(routerMap);
  const newRouter = filterRouter(cloneRouterMap);
  if (location === "header") {
    const firstRouter = [];
    newRouter.forEach((item) => {
      const isRoot = isRootRouter(item);
      const info = isRoot ? item.children[0] : item;
      info.children = undefined;
      const currentMenu = {
        ...info,
        ...info.meta,
        label: info.meta?.title,
        key: info.name,
      };
      firstRouter.push(currentMenu);
    });
    return firstRouter;
  } else {
    return getChildrenRouter(
      newRouter.filter((item) => item.name === routerName)
    );
  }
}

/**
 * 递归组装子菜单
 * */
export function getChildrenRouter(routerMap) {
  return filterRouter(routerMap).map((item) => {
    const isRoot = isRootRouter(item);
    const info = isRoot ? item.children[0] : item;
    const currentMenu = {
      ...info,
      ...info.meta,
      label: info.meta?.title,
      key: info.name,
    };
    // 是否有子菜单，并递归处理
    if (info.children && info.children.length > 0) {
      // Recursion
      currentMenu.children = getChildrenRouter(info.children);
    }
    return currentMenu;
  });
}

export const withInstall = (component, alias) => {
  const comp = component;
  comp.install = (app) => {
    app.component(comp.name || comp.displayName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component;
};

/**
 *  找到对应的节点
 * */
let result = null;
export function getTreeItem(data, key) {
  data.map((item) => {
    if (item.key === key) {
      result = item;
    } else {
      if (item.children && item.children.length) {
        getTreeItem(item.children, key);
      }
    }
  });
  return result;
}

/**
 *  找到所有节点
 * */
const treeAll = [];
export function getTreeAll(data) {
  data.map((item) => {
    treeAll.push(item.key);
    if (item.children && item.children.length) {
      getTreeAll(item.children);
    }
  });
  return treeAll;
}

// dynamic use hook props
export function getDynamicProps(prop) {
  const ret = {};

  Object.keys(props).map((key) => {
    ret[key] = unref(props[key]);
  });

  return ret;
}

/**
 * Sums the passed percentage to the R, G or B of a HEX color
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed part of the color
 */
function addLight(color, amount) {
  const cc = parseInt(color, 16) + amount;
  const c = cc > 255 ? 255 : cc;
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`;
}

/**
 * Lightens a 6 char HEX color according to the passed percentage
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed color represented as HEX
 */
export function lighten(color, amount) {
  color = color.indexOf("#") >= 0 ? color.substring(1, color.length) : color;
  amount = Math.trunc((255 * amount) / 100);
  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount
  )}${addLight(color.substring(4, 6), amount)}`;
}

/**
 * 判断是否 url
 * */
export function isUrl(url) {
  return /^(http|https):\/\//g.test(url);
}

export const randomRgb = (min, max, opacity) => {
  let R = Math.floor(Math.random() * (max - min)) + min;
  let G = Math.floor(Math.random() * (max - min)) + min;
  let B = Math.floor(Math.random() * (max - min)) + min;
  return "rgba(" + R + "," + G + "," + B + ", " + opacity + ")";
};

export const timeControl = (t) => {
  return h(
    NTooltip,
    { trigger: "hover" },
    {
      default: () =>
        h(NTime, {
          timeZone: "Asia/Shanghai",
          time: new Date(t),
          format: "yyyy-MM-dd HH:mm:ss",
        }),
      trigger: () =>
        h(NTime, {
          timeZone: "Asia/Shanghai",
          time: new Date(t),
          type: "relative",
        }),
    }
  );
};
