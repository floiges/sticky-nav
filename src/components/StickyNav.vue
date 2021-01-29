<template>
  <div
    class="sticky-nav-container"
    :style="`--text-color: ${menu.textColor}`"
    :class="{ 'text-height': menu.menuType === 1, 'image-height': menu.menuType === 0 }">
    <div
      :class="{ 'sticky-nav-fixed': sticky && enableFixed }"
      :style="`top: ${stickyOptions.stickyTop}px; z-index: ${stickyOptions.zIndex}; background: ${menu.bgColor}`">
      <span
        v-if="showButton"
        class="stickyNav-expand"
        :class="{ 'expand': isShowAll }"
        ref="showAllButton"
        @click="expand">
        <span class="sticky-nav-arrow"></span>
      </span>
      <div v-if="isShowAll" class="sticky-nav-expand-topbar">{{stickyOptions.title}}</div>
      <div class="sticky-nav" ref="stickyNav">
        <div class="scroll-view" ref="scrollView">
          <ul class="sticky-nav-ul">
            <li
              class="sticky-nav-item"
              v-for="(nav, index) in navs"
              :key="`normal-${index}`"
              :class="{ 'active': sectionToNavMap[activeIndex] === index, 'indicator': menu.menuType === 1 }"
              ref="navItem"
              @click="change(index)">
              <img class="sticky-nav-item-img" :src="nav.img" v-if="menu.menuType === 0">
              <span class="sticky-nav-item-title">{{nav.title || `导航${index + 1}`}}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="sticky-nav-expand-panel" v-show="isShowAll">
        <ul class="sticky-nav-ul">
          <li
            class="sticky-nav-item"
            v-for="(nav, index) in navs"
            :key="`panel-${index}`"
            :class="{ 'active': sectionToNavMap[activeIndex] === index }"
            @click="change(index)">
            <img class="sticky-nav-item-img" :src="nav.img" v-if="menu.menuType === 0">
            <span class="sticky-nav-item-title">{{nav.title || `导航${index + 1}`}}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js';

const DEFAULT_OPTIONS = {
  zIndex: 1001,
  // 吸顶距离顶部的位置
  stickyTop: 0,
  // 到达内容之前多少像素则选中
  thresold: 0,
  //导航滚动是否使用动画
  scrollAnimate: true,
  title: "请选择分类",
};
export default {
  props: {
    options: {
      type: Object,
    },
    menu: {
      type: Object,
    },
  },
  data() {
    return {
      stickyOptions: {},
      activeIndex: 0,
      isShowAll: false,
      translateX: 0,
      sticky: false,
      sectionToNavMap: {},
    };
  },
  computed: {
    navs() {
      return this.menu.list || [];
    },
    stickyNav() {
      return this.$refs.stickyNav;
    },
    scrollView() {
      return this.$refs.scrollView;
    },
    showButton() {
      return this.navs.length >= 4;
    },
    buttonWidth() {
      if (this.showButton) {
        return this.$refs.showAllButton.offsetWidth + 'px';
      }
      return 0;
    },
    enableFixed() {
      // 允许吸顶
      return this.menu.positionType === 'fixed';
    },
  },
  watch: {
    'options.sectionElement': {
      handler(sectionElement) {
        this.sectionElement = sectionElement;
        const sections = Array.from(this.sectionElement.getElementsByClassName(this.stickyOptions.sectionSelector));
        // 过滤掉导航组件上方的内容
        const index = sections.findIndex(section => {
          const componentType = section.getAttribute('component-type');
          return componentType === 'menu';
        });
        if (index !== -1) {
          this.sections = sections.slice(index + 1);
        } else {
          this.sections = sections;
        }
        this.createSectionNavMap();
      },
    },
    'options.scrollTop': {
      // 监听滚动
      handler(scrollTop) {
        this.scrollTop = scrollTop;
        this.scrollHandler();
      },
    },
    translateX(newValue, oldValue) {
      if (this.stickyOptions.scrollAnimate) {
        this.tween(oldValue, newValue);
        return;
      }
      this.scrollView.scrollLeft = -newValue;
    },
    activeIndex(newValue) {
      setTimeout(() => {
        this.centerTitleAtIndex(newValue);
      }, 0);
      this.$emit('changed', newValue);
    },
    isShowAll(state) {
      this.$emit('expand', state);
      let $overlay = this.getOverlay();
      if (!$overlay) {
        return;
      }
      $overlay.style.display = state ? 'block' : 'none';
    },
  },
  created() {
    this.stickyOptions = Object.assign({}, DEFAULT_OPTIONS, this.options);
  },
  mounted() {
    const { thresold, stickyTop } = this.stickyOptions;
    this.stickyOptions.thresold = thresold + this.stickyNav.offsetHeight + stickyTop;

    if (this.showButton) {
      this.createOverlay();
      this.stickyNav.style.paddingRight = this.buttonWidth;
    }
  },
  methods: {
    change(index) {
      this.isShowAll = false;
      this.scrollTo(index);
      this.$emit('click', index);
    },
    scrollTo(index) {
      // 根据 nav index 查找 section index
      let sectionIndex = this.navToSectionMap[index];
      if (typeof sectionIndex === 'undefined') {
        sectionIndex = -1;
      }
      if (sectionIndex === -1) {
        return;
      }

      const scrollTop = this.getElementScrollTop(this.sections[sectionIndex]);
      this.sectionElement.scrollTo(0, scrollTop - this.stickyOptions.thresold);
    },
    // 移动标题到导航栏中心
    centerTitleAtIndex(sectionIndex) {
      // 根据 section index 查找 nav index
      let navIndex = this.sectionToNavMap[sectionIndex];
      if (typeof navIndex === 'undefined') {
        navIndex = -1;
      }
      if (navIndex === -1) {
        return;
      }

      const activeItem = this.$refs.navItem[navIndex];
      const offsetLeft = activeItem.offsetLeft;
      const offsetWidth = activeItem.offsetWidth;
      const touchWidth = this.stickyNav.offsetWidth;
      const buttonWidth = this.buttonWidth;
      const scrollWidth = this.scrollView.scrollWidth - touchWidth + buttonWidth;
      if (scrollWidth === 0) {
        return;
      }

      const half = (touchWidth - offsetWidth) / 2;
      let scrollLeft = half - offsetLeft;
      // 两种边界情况
      if (scrollLeft > 0) {
        scrollLeft = 0;
      }
      if (scrollLeft < -scrollWidth) {
        scrollLeft = -scrollWidth;
      }
      this.translateX = scrollLeft;
    },
    expand() {
      this.isShowAll = this.isShowAll ? false : true;
    },
    scrollHandler() {
      if (!this.enableFixed) {
        return;
      }

      const scrollTop = this.scrollTop;
      const navOffsetTop = this.getElementScrollTop(this.$el);

      if (this.sections.length > 0) {
        if (scrollTop < navOffsetTop) {
          this.activeIndex = 0;
        }
        // 超过最后一个停止吸顶
        let lastSection = this.sections[this.sections.length - 1];
        if (scrollTop > (this.getElementScrollTop(lastSection) + lastSection.offsetHeight) || scrollTop < navOffsetTop) {
          this.sticky = false;
        } else {
          this.sticky = true;
        }
      }

      for (let i = 0; i < this.sections.length; i++) {
        const section = this.sections[i];
        let offsetTop = this.getElementScrollTop(section);

        if ((offsetTop - this.stickyOptions.thresold) <= scrollTop && (offsetTop + section.offsetHeight) > scrollTop) {
          this.activeIndex = i;
        }
      }
    },
    handleOverlayClick() {
      this.overlay.style.display = 'none';
      this.isShowAll = false;
    },
    tween(startValue, endValue) {
      const animate = () => {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      };

      const scrollView = this.scrollView;
      new TWEEN.Tween({
        number: startValue,
      }).to({
        number: endValue
      }, 100).onUpdate((tween) => {
        scrollView.scrollLeft = -tween.number;
      }).start();
      animate();
    },
    createOverlay() {
      if (this.getOverlay()) {
        return;
      }
      const div = document.createElement('div');
      div.className = 'sticky-nav-overlay';
      div.style = `
        background: rgba(0, 0, 0, 0.4);
        position: fixed;
        width: 100%;
        left: 0;
        top: 0;
        height: 100%;
        display: none;
        z-index: 999;
      `;
      div.addEventListener('touchstart', () => {
        div.style.display = 'none';
        this.isShowAll = false;
      });
      div.addEventListener('click', () => {
        div.style.display = 'none';
        this.isShowAll = false;
      });
      document.body.appendChild(div);
    },
    getOverlay() {
      return document.getElementsByClassName('sticky-nav-overlay')[0];
    },
    createSectionNavMap() {
      // sections 与 navs 并非一一对应，因此需根据 component-id 作为媒介进行关联
      // section index: nav index
      this.sectionToNavMap = {};
      this.navToSectionMap = {};

      for (let sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
        const section = this.sections[sectionIndex];
        const componentId = section.getAttribute('component-id');
        if (!componentId) {
          continue;
        }
        const navIndex = this.navs.findIndex(nav => {
          const id = nav.id;
          return id === componentId;
        });
        this.sectionToNavMap[sectionIndex] = navIndex;
        if (navIndex !== -1) {
          this.navToSectionMap[navIndex] = sectionIndex;
        }
      }
    },
    getElementScrollTop(element) {
      let top = 0;
      while(element.offsetParent !== undefined && element.offsetParent !== null) {
        top += element.offsetTop + (element.clientTop !== null ? element.clientTop : 0);
        element = element.offsetParent;
      }
      return top;
    },
  },
}
</script>

<style lang="scss" scoped>
.sticky-nav-container {
  &.image-height {
    --nav-height: 140px;
    .sticky-nav {
      line-height: 40px;
      .sticky-nav-item {
        &-img {
          margin-top: 8px;
        }
        &-title {
          margin-top: 8px;
        }
      }
    }
    .sticky-nav-expand-topbar {
      font-size: 36px;
    }
    .sticky-nav-expand-panel {
      .sticky-nav-ul {
        justify-content: space-around;
      }
      .sticky-nav-item {
        padding: 0 25px;
      }
    }
  }
  &.text-height {
    --nav-height: 80px;
  }
  position: relative;
  z-index: 1000;
  height: var(--nav-height);
  .sticky-nav-fixed {
    width: 100%;
    position: fixed;
    transition: transform .3s ease-out;
  }

  .stickyNav-expand {
    height: var(--nav-height);
    position: absolute;
    width: 75px;
    top: 0;
    right: 0;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateZ(0);
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 35px;
      background: var(--text-color);
      opacity: 0.5;
    }
    .sticky-nav-arrow {
      width: 40px;
      height: 30px;
      display: block;
      position: relative;
      &::before, &::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 4px;
        background: var(--text-color);
        border-radius: 2px;
        transition: transform 0.4s;
      }
      &::before {
        transform: translateY(20px) rotate(40deg);
        transform-origin: 100% 0;
        right: 45%;
      }

      &::after {
        transform: translateY(20px) rotate(-40deg);
        transform-origin: 0 0;
        left: 45%;
      }
    }
    &.expand {
      &::before {
        background: #DBDBDB;
      }
      .sticky-nav-arrow {
        &::before {
          background: #585858;
          transform: translateY(5px) rotate(-40deg);
          transform-origin: 100% 100%;
        }

        &::after {
          background: #585858;
          transform: translateY(5px) rotate(40deg);
          transform-origin: 0 100%;
        }
      }
    }
  }

  .sticky-nav {
    height: var(--nav-height);
    line-height: var(--nav-height);
    .scroll-view {
      overflow-x: scroll;
      white-space: nowrap;
      min-width: 100%;
      padding: 0 16px;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    &-ul {
      width: 100%;
      white-space: nowrap;
    }
    &-item {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      margin-right: 75px;
      font-size: 26px;
      &-img {
        width: 80px;
        height: 80px;
      }
      &-title {
        color: var(--text-color);
      }
      &.active {
        font-size: 28px;
        font-weight: bold;
        color: #fff;
        &.indicator::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 7px;
          background: #fff;
          border-radius: 5px 5px 0 0;
        }
        .sticky-nav-item-title {
          color: #fff;
        }
      }
    }
  }
  .sticky-nav-expand-topbar {
    height: var(--nav-height);
    line-height: var(--nav-height);
    text-indent: 54px;
    font-size: 24px;
    background: #fff;
    color: #585858;
    position: absolute;
    top: 0;
    z-index: 1;
    width: 100%;
    transform: translateZ(0);
  }
  .sticky-nav-expand-panel {
    background: #fff;
    position: absolute;
    left: 0;
    right: 0;
    top: var(--nav-height);
    overflow: hidden;
    z-index: 1;
    opacity: 0.75;
    transform: translateZ(0);
    .sticky-nav-ul {
      padding-bottom: 30px;
      display: flex;
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
      z-index: 1;
      opacity: 0.75;
    }
    .sticky-nav-item {
      padding: 0 40px;
      margin-top: 30px;
      margin-right: 0;
      text-align: center;
      &-title {
        color: #333333;
      }
      &.active {
        font-size: 26px;
        font-weight: bold;
        .sticky-nav-item-title {
          color: var(--text-color);
        }
      }
    }
  }
}
</style>