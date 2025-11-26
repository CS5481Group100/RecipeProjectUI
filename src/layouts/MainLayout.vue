<template>
  <a-layout class="main-layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      class="sidebar"
      :trigger="null"
      collapsible
      :width="250"
      :collapsed-width="80"
      theme="light"
    >
      <div class="logo">
        <h2 v-if="!collapsed">Recipe AI</h2>
        <span v-else>AI</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :inline-collapsed="collapsed"
        @click="handleMenuClick"
      >
        <a-menu-item key="chat">
          <template #icon>
            <MessageOutlined />
          </template>
          <span>Recipe Chat</span>
        </a-menu-item>
        <a-menu-item key="knowledge">
          <template #icon>
            <BookOutlined />
          </template>
          <span>RAG Managent</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 主要内容区域 -->
    <a-layout class="content-layout">
      <!-- Header -->
      <a-layout-header class="page-header">
        <div class="header-left">
          <menu-fold-outlined
            v-if="!collapsed"
            class="trigger"
            @click="collapsed = true"
          />
          <menu-unfold-outlined
            v-else
            class="trigger"
            @click="collapsed = false"
          />
        </div>
        <div class="header-title">
          {{ activePageTitle }}
        </div>
        <div class="header-right">
          <!-- 可以添加其他头部内容 -->
        </div>
      </a-layout-header>

      <!-- Main Content -->
      <a-layout-content class="page-content">
        <router-view />
      </a-layout-content>

      <!-- Footer -->
      <a-layout-footer class="page-footer">
        <p>&copy; 2025 Recipe AI Assistant. All rights reserved.</p>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  BookOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const selectedKeys = ref(['chat'])

const pageTitle = {
  Chat: 'Recipe Agent',
  Knowledge: 'RAG Management',
}

const activePageTitle = computed(() => {
  return pageTitle[route.name] || 'Recipe AI'
})

// 根据当前路由更新选中的菜单项
watch(
  () => route.name,
  (newName) => {
    if (newName === 'Chat') {
      selectedKeys.value = ['chat']
    } else if (newName === 'Knowledge') {
      selectedKeys.value = ['knowledge']
    }
  },
  { immediate: true }
)

const handleMenuClick = (e) => {
  selectedKeys.value = [e.key]
  if (e.key === 'chat') {
    router.push({ name: 'Chat' })
  } else if (e.key === 'knowledge') {
    router.push({ name: 'Knowledge' })
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
}

.sidebar {
  background-color: #fafafa;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}

.logo {
  height: 64px;
  padding: 0 24px;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1890ff;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
}

.logo span {
  font-size: 16px;
}

.content-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #000000d9;
  margin-left: 16px;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* allow inner views to manage their own scrolling */
  min-height: 0;
  background-color: #fafafa;
}

.page-footer {
  background-color: white;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  padding: 24px;
}

.page-footer p {
  margin: 0;
  color: #999;
  font-size: 14px;
}
</style>
