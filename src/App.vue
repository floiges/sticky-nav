<template>
  <div class="page" ref="document">
    <div class="container">
      <div
        class="list-item"
        v-for="item in sections"
        :key="item.id"
        :component-id="item.id"
        :component-type="item.type">
        <div v-if="item.type === 'list'" class="item-list">
          {{item.id}}
        </div>
        <sticky-nav v-if="item.type === 'menu'" :menu="menu" :options="stickyOptions"></sticky-nav>
      </div>
    </div>
  </div>
</template>

<script>
import throttle from 'lodash.throttle';
import StickyNav from './components/StickyNav.vue';

export default {
  name: 'App',
  data() {
    return {
      sections: [
        {
          id: '1000000',
          type: 'menu',
        },
        {
          id: '1000',
          type: 'list',
        },
        {
          id: '1001',
          type: 'list',
        },
        {
          id: '1002',
          type: 'list',
        },
        {
          id: '1003',
          type: 'list',
        },
        {
          id: '1004',
          type: 'list',
        },
      ],
      menu: {
        positionType: 'fixed',
        menuType: 1,
        textColor: '#fff',
        bgColor: '#ff8a8a',
        list: [
          {
            title: '导航1',
            id: 1000,
          },
          {
            title: '导航2',
            id: 1001,
          },
          {
            title: '导航3',
            id: 1002,
          },
          {
            title: '导航4',
            id: 1003,
          },
          {
            title: '导航5',
            id: 1004,
          },
        ]
      },
      stickyOptions: {
				sectionElement: null,
				sectionSelector: 'list-item',
				scrollAnimate: true,
				stickyTop: -1,
				title: '切换楼层',
				scrollTop: 0,
			},
    };
  },
  mounted() {
    this.throttleScroll = throttle(this.onScroll, 100);
    this.$refs.document.addEventListener('scroll', this.throttleScroll);
    this.stickyOptions.sectionElement = this.$refs.document;
  },
  beforeDestroy() {
		this.$refs.document.removeEventListener('scroll', this.throttleScroll);
  },
  methods: {
    onScroll() {
      this.stickyOptions.scrollTop = this.$refs.document.scrollTop;
    },
  },
  components: {
    StickyNav,
  }
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  margin: 0;
	padding: 0;
	position: relative;
	height: 100vh;
	overflow-y: scroll;
}
.container {
  min-height: 100vh;
}
.list-item {
  font-size: 0;
}
.item-list {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ff7124;
  color: #333;
  font-size: 30px;
  font-weight: bold;
}
</style>
