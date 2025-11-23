<template>
  <div class="chat-view">
    <!-- Messages Container -->
    <a-layout-content class="chat-messages">
      <div v-if="messages.length === 0" class="empty-state">
        <a-empty description="还没有对话记录" />
        <p>开始与AI助手交流吧！</p>
      </div>
      <div v-else class="messages-list">
        <chat-message v-for="msg in messages" :key="msg.id" :message="msg" />
        <div v-if="loading" class="loading-indicator">
          <a-spin tip="AI正在思考..." />
        </div>
        <div ref="messagesEnd"></div>
      </div>
    </a-layout-content>

    <!-- Input Footer -->
    <div class="chat-footer">
      <div class="input-wrapper">
        <a-input-group compact class="chat-input-group">
          <a-input
            v-model:value="inputMessage"
            placeholder="输入你的消息..."
            @keyup.enter="handleSendMessage"
            :disabled="loading"
            allow-clear
          />
          <a-button
            type="primary"
            @click="handleSendMessage"
            :loading="loading"
            :disabled="!inputMessage.trim() || loading"
          >
            发送
          </a-button>
        </a-input-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { sendStreamMessage } from '@/api/chatService'
import ChatMessage from '@/components/ChatMessage.vue'
import { message as antMessage } from 'ant-design-vue'
import { isEmpty } from 'lodash'

const chatStore = useChatStore()
const inputMessage = ref('')
const messagesEnd = ref(null)

const messages = computed(() => chatStore.messages)
const loading = computed(() => chatStore.loading)

// 滚动到最新消息
const scrollToBottom = async () => {
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

// 处理发送消息
const handleSendMessage = async () => {
  if (!inputMessage.value.trim()) {
    antMessage.warning('请输入消息内容')
    return
  }

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息
  chatStore.addMessage({
    role: 'user',
    content: userMessage,
  })

  await scrollToBottom()

  // 发送消息到API（使用流式接口）
  chatStore.setLoading(true)
  try {
    let assistantContent = ''
    let assistantMessageId = null

    let meta = {}

    await sendStreamMessage(userMessage, async (chunk, metastr) => {
      assistantContent += chunk

      if (isEmpty(meta) && metastr) {
        try {
          meta = JSON.parse(metastr)
          console.log(meta)
        } catch (e) {
          console.error('解析元数据失败:', e)
        }
      }
      
      // 如果还没有创建AI消息，先创建一个
      if (assistantMessageId === null) {
        chatStore.addMessage({
          role: 'assistant',
          content: assistantContent,
        })
        // 获取最后添加的消息ID
        assistantMessageId = messages.value[messages.value.length - 1].id
      } else {
        // 更新最后的AI消息内容
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage && lastMessage.id === assistantMessageId) {
          lastMessage.content = assistantContent
        }
      }

      await scrollToBottom()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    antMessage.error('发送失败，请检查网络连接')
    
    // 添加错误消息
    chatStore.addMessage({
      role: 'assistant',
      content: '抱歉，发生了一个错误。请稍后重试。',
    })
  } finally {
    chatStore.setLoading(false)
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  /* allow inner flex children to scroll correctly */
  min-height: 0;
}

.chat-messages {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  /* ensure children can define their own scroll area */
  min-height: 0;
}

.chat-input-group {
  display: flex;
  flex-direction: row;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
  color: #999;
}

.messages-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* make messages list independently scrollable */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.chat-footer {
  background-color: white;
  border-top: 1px solid #e8e8e8;
  padding: 16px 24px;
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* 美化滚动条（应用到滚动的消息列表） */
.messages-list::-webkit-scrollbar {
  width: 8px;
}

.messages-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.messages-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
