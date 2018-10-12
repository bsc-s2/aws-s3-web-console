import Vue from 'vue'
import Router from 'vue-router'
import store from './store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'bucket',
      meta: { requiresKeys: true },
      component: () =>
        import(/* webpackChunkName: "bucket" */ './views/Bucket.vue'),
    },
    {
      path: '/file/:prefix',
      name: 'file',
      meta: { requiresKeys: true },
      component: () =>
        import(/* webpackChunkName: "bucket" */ './views/Bucket.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () =>
        import(/* webpackChunkName: "login" */ './views/Login.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresKeys)) {
    store.getters.hasKeys ? next() : next({ path: '/login' })
  } else {
    next()
  }
})

export default router
