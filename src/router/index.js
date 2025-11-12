import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import ChatView from '@/pages/ChatView.vue'
import KnowledgeBase from '@/pages/KnowledgeBase.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Chat',
        component: ChatView,
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: KnowledgeBase,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
