<template>
  <div class="chat-message" :class="message.role">
    <div class="message-avatar">
      <a-avatar
        :size="40"
        :style="{
          backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a',
        }"
        :icon="message.role === 'user' ? h(UserOutlined) : h(RobotOutlined)"
      />
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-text">{{ message.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { Avatar as AAvatar } from 'ant-design-vue'
import { UserOutlined, RobotOutlined } from '@ant-design/icons-vue'

defineProps({
  message: {
    type: Object,
    required: true,
    validator: (msg) => msg.role && msg.content !== undefined,
  },
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-message.user .message-content {
  align-items: flex-end;
}

.message-header {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.chat-message.user .message-header {
  flex-direction: row-reverse;
}

.message-role {
  font-weight: 500;
}

.message-time {
  font-size: 11px;
}

.message-text {
  background-color: #f5f5f5;
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-word;
  max-width: 500px;
  line-height: 1.5;
}

.chat-message.user .message-text {
  background-color: #1890ff;
  color: white;
}
</style>
